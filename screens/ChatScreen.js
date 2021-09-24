import React, { useLayoutEffect, useState } from 'react';
import { Platform } from 'react-native';
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
import { Avatar, Input } from 'react-native-elements';
import { Keyboard } from 'react-native';
import { db, auth } from '../firebase';
import * as firebase from 'firebase';

const ChatScreen = ({ navigation, route }) => {
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState([]);

	function sendMessage() {
		Keyboard.dismiss();
		db.collection('chats').doc(route.params.id).collection('messages').add({
			timestamp: firebase.firestore.FieldValue.serverTimestamp(),
			message: input,
			displayName: auth.currentUser.displayName,
			email: auth.currentUser.email,
			photoURL: auth.currentUser.photoURL,
		});

		setInput('');
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
										<Text style={styles.sendText}>{data.message}</Text>
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
										<Text style={styles.receiverText}>{data.message}</Text>
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
});
