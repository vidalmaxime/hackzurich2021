const functions = require('firebase-functions');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');
const data = new FormData();

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

exports.processAudio = functions.storage.object().onFinalize(async (object) => {
	const fileName = object.name;
	const bucket = object.bucket;
	const tempFilePath = path.join(os.tmpdir(), fileName);

	await bucket.file(filePath).download({ destination: tempFilePath });

	data.append('audiofile', fs.createReadStream(tempFilePath));

	const config = {
		method: 'post',
		url: 'http://4897-128-178-84-41.ngrok.io/speech2text',
		headers: {
			...data.getHeaders(),
		},
		data: data,
	};

	axios(config)
		.then(function (response) {
			console.log(JSON.stringify(response.data));
		})
		.catch(function (error) {
			console.log(error);
		});
	// await admin.firestore().collection('test').add({ test: object.name });
});
