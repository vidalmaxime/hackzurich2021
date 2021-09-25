import React, { useLayoutEffect, useState, useEffect, useRef } from 'react';
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
	ImageBackground, 
	Platform,
	SliderComponent,
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
	const scrollViewRef = useRef(null);
	const abortedRecord = useRef(false);

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

	useEffect(() => {
		if (scrollViewRef.current !== null) {
			scrollViewRef.current.scrollToEnd();
		}
	}, [messages]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: () => (
				<View style={styles.header}>
					<Avatar
						rounded
						source={{
							uri: 'https://www.seekpng.com/png/full/110-1100707_person-avatar-placeholder.png',
						}}
						size='large'
					/>
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

	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

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
			if (abortedRecord.current) {
				console.log('in stop');
				await sleep(300);
				await recording.stopAndUnloadAsync();
				abortedRecord.current = false;
			} else {
				setRecording(recording);
				console.log('Recording started');
			}
		} catch (err) {
			console.error('Failed to start recording', err);
		}
	}

	async function stopRecording() {
		console.log('Stopping recording..');
		if (recording !== undefined) {
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
		} else {
			abortedRecord.current = true;
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.containerAvoid}
				keyboardVerticalOffset={90}
			>
			<ImageBackground source={require('../assets/CelestialGradient.png')} resizeMode='cover' style={styles.image}>
			{/* <LinearGradient colors={['black', 'white']} style={{flex:1}}> */}
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<>
						<ScrollView
							contentContainerStyle={{
								paddingTop: 15,
							}}
							ref={scrollViewRef}
						>
							{messages
								.slice(0)
								.reverse()
								.map(({ id, data }) =>
								data.email === auth.currentUser.email ? (
									<View key={id} style={styles.sender}>
										<Avatar
											rounded
											source={{ uri: data.photoURL }}
											size='medium'
										/>
										<AudioPlayer id={data.fileId} />
									</View>
								) : (
									<View key={id} style={styles.receiver}>
										<Avatar
											rounded
											source={{ uri: data.photoURL }}
											size='medium'
										/>

										<AudioPlayer
											id={data.fileId}
										/>
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
									style={styles.micActivated}
									source={require('../assets/microphone.png')}
								/>
							) : (
								<Image
									style={styles.micDeactivated}
									source={require('../assets/microphone.png')}
								/>
							)}
						</TouchableOpacity>
					</>
				</TouchableWithoutFeedback>
			</ImageBackground>
			{/* </LinearGradient> */}
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default ChatScreen;

const styles = StyleSheet.create({
	header: {
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: 'black'
	},
	container: {
		flex: 1,
	},
	containerAvoid: {
		flex: 1,
	},
	image: {
		flex:1,
		justifyContent: 'center',

	},
	footer: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		padding: 20,
	},
	receiver: {
		flexDirection: 'row',
		width: '80%',
		padding: '5%',
		margin: '5%',
		alignSelf: 'flex-start',

		backgroundColor: 'rgba(0, 0, 0, 0.2)',
		borderRadius: 30,

		// iOS only
		shadowOffset: {
			width: 20,
			height: 20,
		},
		shadowColor: "black",
		shadowOpacity: 1.,
	},
	sender: {
		flexDirection: 'row-reverse',
		width: '80%',
		padding: '5%',
		margin: '5%',
		alignSelf: 'flex-end',

		backgroundColor: 'rgba(0, 0, 0, 0.35)',
		borderRadius: 30,
		
		// iOS only
		shadowOffset: {
			width: 20,
			height: 20,
		},
		shadowColor: "black",
		shadowOpacity: 1.,
	},
	micActivated: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 40,
		backgroundColor: "rgba(0, 0, 0, 0.4)",
	},
	micDeactivated: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 40,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
	},
	containerRecord: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
