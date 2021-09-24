import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { Icon } from 'react-native-elements/dist/icons/Icon';
import { db } from '../firebase';

const AddChatScreen = ({ navigation }) => {
	const [input, setInput] = useState('');

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: 'Add a new chat',
		});
	}, [navigation]);

	async function createChat() {
		await db
			.collection('chats')
			.add({
				chatName: input,
			})
			.then(() => {
				navigation.goBack();
			})
			.catch((error) => alert(error.message));
	}

	return (
		<View style={styles.container}>
			<Input
				placeholder='Enter a chat name'
				value={input}
				onChangeText={(text) => setInput(text)}
				leftIcon={
					<Icon name='wechat' type='antdesign' size={24} color='black' />
				}
				onSubmitEditing={createChat}
			/>
			<Button disabled={!input} title='Create new Chat' onPress={createChat} />
		</View>
	);
};

export default AddChatScreen;

const styles = StyleSheet.create({
	container: {},
});
