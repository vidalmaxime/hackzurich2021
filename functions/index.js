// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');
const path = require('path');
const os = require('os');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.processAudio = functions.storage.object().onFinalize(async (object) => {
	const data = new FormData();

	const fileName = object.name;
	const fileBucket = object.bucket;
	const bucket = admin.storage().bucket(fileBucket);
	const tempFilePath = path.join(os.tmpdir(), fileName);
	await bucket.file(fileName).download({ destination: tempFilePath });
	data.append('audiofile', fs.createReadStream(tempFilePath));
	const config = {
		method: 'post',
		url: 'http://2652-128-178-84-41.ngrok.io/speech2text',
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
