import React, { useLayoutEffect, useState } from 'react';
import { Platform } from 'react-native';
import { ScrollView } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	TouchableWithoutFeedback,
	Image,
	TouchableOpacity,
} from 'react-native';
import { Avatar, Button } from 'react-native-elements';
import { Keyboard } from 'react-native';
import { db, auth } from '../firebase';
import * as firebase from 'firebase';
import { Audio } from 'expo-av';
import AudioPlayer from '../components/AudioPlayer';
import uuid from 'react-native-uuid';

const ChatScreen = ({ navigation, route }) => {
	const [messages, setMessages] = useState([]);
	const [recording, setRecording] = React.useState();

	function sendAudioMessage(id) {
		console.log('hello');

		db.collection('chats').doc(route.params.id).collection('messages').add({
			timestamp: firebase.firestore.FieldValue.serverTimestamp(),
			message: 'this is an audio',
			type: 'audio',
			fileId: id,
			displayName: auth.currentUser.displayName,
			email: auth.currentUser.email,
			photoURL: auth.currentUser.photoURL,
		});
	}

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: () => (
				<View
					style={{ marginLeft: 20, flexDirection: 'row', alignItems: 'center' }}
				>
					<Avatar
						rounded
						source={{
							uri: 'https://www.seekpng.com/png/full/110-1100707_person-avatar-placeholder.png',
						}}
					/>
					<Text> {route.params.chatName} </Text>
				</View>
			),
		});
	}, [navigation]);

	useLayoutEffect(() => {
		const unsubscribe = db
			.collection('chats')
			.doc(route.params.id)
			.collection('messages')
			.orderBy('timestamp', 'desc')
			.onSnapshot((snapshot) => {
				setMessages(
					snapshot.docs.map((doc) => ({
						id: doc.id,
						data: doc.data(),
					}))
				);
			});

		return unsubscribe;
	}, [route]);

	async function startRecording() {
		try {
			console.log('Requesting permissions..');
			await Audio.requestPermissionsAsync();
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});
			console.log('Starting recording..');
			const { recording } = await Audio.Recording.createAsync(
				Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
			);
			setRecording(recording);
			console.log('Recording started');
		} catch (err) {
			console.error('Failed to start recording', err);
		}
	}

	async function stopRecording() {
		console.log('Stopping recording..');
		setRecording(undefined);
		await recording.stopAndUnloadAsync();
		const uri = recording.getURI();
		console.log('Recording stopped and stored at', uri);
		const response = await fetch(uri);
		const blob = await response.blob();
		if (blob != null) {
			const uriParts = uri.split('.');
			const fileType = uriParts[uriParts.length - 1];
			const nameOfFile = uuid.v4();

			firebase
				.storage()
				.ref()
				.child(`${nameOfFile}.${fileType}`)
				.put(blob, {
					contentType: `audio/${fileType}`,
				})
				.then(() => {
					console.log('Sent!');
					sendAudioMessage(nameOfFile);
				})
				.catch((e) => console.log('error:', e));
		} else {
			console.log('error with blob');
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.containerAvoid}
				keyboardVerticalOffset={90}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<>
						<ScrollView
							contentContainerStyle={{
								paddingTop: 15,
							}}
						>
							{messages.map(({ id, data }) =>
								data.email === auth.currentUser.email ? (
									<View key={id} style={styles.sender}>
										<Avatar
											rounded
											source={{ uri: data.photoURL }}
											position='absolute'
											bottom={-10}
											left={20}
											size={20}
										/>
										<AudioPlayer id={data.fileId} />
									</View>
								) : (
									<View key={id} style={styles.receiver}>
										<Avatar
											rounded
											source={{ uri: data.photoURL }}
											position='absolute'
											bottom={-10}
											right={20}
											size={20}
										/>

										<AudioPlayer id={data.fileId} />
										<Text style={styles.receiverName}>{data.displayName}</Text>
									</View>
								)
							)}
						</ScrollView>

						<TouchableOpacity
							activeOpacity={0.5}
							onPressIn={startRecording}
							onPressOut={stopRecording}
							style={styles.containerRecord}
						>
							{recording ? (
								<Image
									style={styles.recording}
									source={require('../assets/record.png')}
								/>
							) : (
								<Image
									style={styles.notRecording}
									source={require('../assets/record.png')}
								/>
							)}
						</TouchableOpacity>
					</>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default ChatScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	containerAvoid: {
		flex: 1,
	},
	footer: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		padding: 20,
	},
	textInput: {
		bottom: 0,
		marginRight: 15,
		flex: 1,
		height: 40,
		borderRadius: 30,
		padding: 10,
		backgroundColor: '#c5e3cd',
	},
	receiver: {
		padding: 15,
		alignSelf: 'flex-start',
		maxWidth: '80%',
		position: 'relative',
		marginBottom: 20,
	},
	sender: {
		padding: 15,
		alignSelf: 'flex-end',
		maxWidth: '80%',
		position: 'relative',
		marginBottom: 20,
	},
	receiverName: {
		color: 'grey',
		fontSize: 10,
	},
	receiverText: {
		color: 'black',
		fontSize: 15,
	},
	recording: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 5,
		borderColor: 'red',
		marginBottom: 40,
	},
	notRecording: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 5,
		borderColor: 'black',
		marginBottom: 40,
	},
	containerRecord: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
