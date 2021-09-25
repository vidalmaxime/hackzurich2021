speech_key = 'd5da5b312758448ba1c1b07121f3434c'
service_region = 'switzerlandnorth'
from dataclasses import dataclass
import json

from flask import request, jsonify, Flask
from flask_cors import CORS
from pyngrok import ngrok

import azure.cognitiveservices.speech as speechsdk
from transformers import pipeline

from pydub import AudioSegment



def azure_batch_stt(filename: str):
    speech_config = speechsdk.SpeechConfig(
        subscription=speech_key,
        region=service_region
    )

    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
    speech_config.request_word_level_timestamps()

    audio_input = speechsdk.AudioConfig(filename=filename)
    speech_recognizer = speechsdk.SpeechRecognizer(
        speech_config=speech_config,
        audio_config=audio_input
    )

    result = speech_recognizer.recognize_once()
    print(result.text)  # Full transcript with punctuation

    # Get token level timestamps
    stt = json.loads(result.json)
    print(stt)
    # confidences_in_nbest = [item['Confidence'] for item in stt['NBest']]
    best_index = 0  # confidences_in_nbest.index(max(confidences_in_nbest))
    words = stt['NBest'][best_index]['Words']
    print(words)

    print(f"Word\tOffset\tDuration")
    tokens_data = []
    for word in words:
        print(f"{word['Word']}\t{word['Offset']}\t{word['Duration']}")
        tokens_data.append({"word": word['Word'], "offset": word['Offset'], "duration": word['Duration']})

    sentiment_classifier = pipeline('sentiment-analysis')
    speech_utterances = result.text.split(".")


    sentiments = [sentiment_classifier(speech_utterance) for speech_utterance in speech_utterances]
    print(sentiments)

    # NER
    ner_pipeline = pipeline('ner')
    ners = ner_pipeline(result.text)


    speech_length= len(words)
    print(speech_length)
    if speech_length <= 20:
        summary = result.text
    else:
        summarizer = pipeline('summarization')
        summary = summarizer(result.text, min_length=int(0.1*speech_length), max_length=int(0.8*speech_length))[0]["summary_text"]
    print(summary)
    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        return result.text, tokens_data, sentiments, summary, ners
    else:
        return "", "", "", ""


def create_app(*args, ) -> Flask:
    """ Entry point. Creates app without autostart. """
    app = App(port=4030, start=True)  # start=False for gunicorn
    return app.server


@dataclass
class App:
    """ Controller for the application.
    Implements a basic API including /speech2text POST request.
    """

    port: int = None
    threaded: bool = True
    host: str = None
    debug: bool = None
    start: bool = True

    def __post_init__(self):
        app = Flask(__name__)
        CORS(app, origins=["*"], resources={'/*': {"origins": "*"}})
        self.server = app
        self.server.add_url_rule("/speech2text", "speech2text", self.speech2text, methods=["POST"])
        self.server.add_url_rule("/", "default", self.catch, defaults={"path": ""})
        self.server.add_url_rule(
            "/<path:path>", "default", self.catch, defaults={"path": ""}
        )
        self.server.after_request(self.after_request)

        #public_url = ngrok.connect(port='5000').public_url
        #print(public_url)
        #app.config["BASE_URL"] = public_url

        if self.start:
            self.run()

    def after_request(self, response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response

    def run(self):
        self.server.run(
            port=self.port, host=self.host, debug=self.debug, threaded=self.threaded
        )

    def speech2text(self):
        data = request.files["audiofile"]
        print(data)
        print("Received audio sample")

        # Convert m4a to wav
        data.save("sample.m4a")
        mp4_data = AudioSegment.from_file("sample.m4a")
        mp4_data.export("sample.wav", format="wav")

        # Call model
        transcript, token_times, sentiment, summary, ners = azure_batch_stt("sample.wav")
        return jsonify({"transcript": transcript, "token_times":token_times, "sentiment": sentiment, "summary": summary, "ners": ners})

    @staticmethod
    def catch(*args, **kwargs):
        return "Invalid route. Valid routes are /speech2text [POST]"

create_app()