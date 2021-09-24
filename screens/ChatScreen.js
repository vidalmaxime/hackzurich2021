import React, { useLayoutEffect, useState } from 'react';
import { Platform, Image } from 'react-native';
import { ScrollView } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { SimpleLineIcons } from '@expo/vector-icons';
import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	TouchableOpacity,
	TouchableWithoutFeedback,
} from 'react-native';
import { Avatar, Input, Button } from 'react-native-elements';
import { Keyboard } from 'react-native';
import { db, auth } from '../firebase';
import * as firebase from 'firebase';
import { Audio } from 'expo-av';

const ChatScreen = ({ navigation, route }) => {
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState([]);
	const [recording, setRecording] = React.useState();

	function sendMessage() {
		Keyboard.dismiss();
		db.collection('chats').doc(route.params.id).collection('messages').add({
			timestamp: firebase.firestore.FieldValue.serverTimestamp(),
			message: input,
			type: 'text',
			displayName: auth.currentUser.displayName,
			email: auth.currentUser.email,
			photoURL: auth.currentUser.photoURL,
		});

		setInput('');
	}

	function sendAudioMessage() {
		console.log('hello');

		const audioRef = db
			.collection('chats')
			.doc(route.params.id)
			.collection('messages')
			.add({
				timestamp: firebase.firestore.FieldValue.serverTimestamp(),
				message: 'this is an audio',
				type: 'audio',
				displayName: auth.currentUser.displayName,
				email: auth.currentUser.email,
				photoURL: auth.currentUser.photoURL,
			});
		return audioRef;
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
			sendAudioMessage()
				.then((audioRef) => {
					const uriParts = uri.split('.');
					const fileType = uriParts[uriParts.length - 1];
					const nameOfFile = audioRef.id;
					firebase
						.storage()
						.ref()
						.child(`${nameOfFile}.${fileType}`)
						.put(blob, {
							contentType: `audio/${fileType}`,
						})
						.then(() => {
							console.log('Sent!');
						})
						.catch((e) => console.log('error:', e));
				})
				.catch((e) => console.log('error:', e));
		} else {
			console.log('erroor with blob');
		}
	}

	const downloadAudio = async (id) => {
		console.log(id);
		const uri = await firebase.storage().ref(`${id}.m4a`).getDownloadURL();

		console.log('uri:', uri);

		// The rest of this plays the audio
		const soundObject = new Audio.Sound();
		try {
			await soundObject.loadAsync({ uri });
			await soundObject.playAsync();
		} catch (error) {
			console.log('error:', error);
		}
	};

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
										{data.type === 'text' ? (
											<Text style={styles.sendText}>{data.message}</Text>
										) : (
											<TouchableOpacity
												activeOpacity={0.5}
												onPress={() => downloadAudio(id)}
											>
												<Image
													style={styles.playButton}
													source={require('../assets/play.png')}
												/>
											</TouchableOpacity>
										)}
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
										{data.type === 'text' ? (
											<Text style={styles.receiverText}>{data.message}</Text>
										) : (
											<TouchableOpacity
												activeOpacity={0.5}
												onPress={() => downloadAudio(id)}
											>
												<Image
													style={styles.playButton}
													source={require('../assets/play.png')}
												/>
											</TouchableOpacity>
										)}
										<Text style={styles.receiverName}>{data.displayName}</Text>
									</View>
								)
							)}
						</ScrollView>
						<View style={styles.footer}>
							<Input
								value={input}
								onChangeText={(text) => setInput(text)}
								placeholder='Send message'
								style={styles.textInput}
								onSubmitEditing={sendMessage}
							/>
							<TouchableOpacity activeOpacity={0.5} onPress={sendMessage}>
								<SimpleLineIcons name='cursor' size={16} color='black' />
							</TouchableOpacity>
						</View>
						<View>
							<Button
								title={recording ? 'Stop Recording' : 'Start Recording'}
								onPress={recording ? stopRecording : startRecording}
							/>
						</View>
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
	playButton: {
		width: 30,
		height: 30,
	},
});
