import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { StyleSheet, View, KeyboardAvoidingView } from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import { auth } from '../firebase';

const RegisterScreen = ({ navigation }) => {
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [imgUrl, setImgUrl] = useState('');

	function register() {
		console.log('Register');
		auth
			.createUserWithEmailAndPassword(email, password)
			.then((authUser) => {
				authUser.user.updateProfile({
					displayName: fullName,
					photoURL:
						imgUrl ||
						'https://www.seekpng.com/png/full/110-1100707_person-avatar-placeholder.png',
				});
				navigation.replace('Login');
			})
			.catch((error) => alert(error.message));
	}

	return (
		<KeyboardAvoidingView behavior='padding' style={styles.container}>
			<StatusBar style='light' />
			<Text h3 style={{ marginBottom: 50 }}>
				Create a Circle account.
			</Text>
			<View style={styles.inputContainer}>
				<Input
					placeholder='Full Name'
					autoFocus
					type='text'
					value={fullName}
					onChangeText={(text) => setFullName(text)}
				/>
				<Input
					placeholder='Email'
					type='email'
					value={email}
					onChangeText={(text) => setEmail(text)}
				/>
				<Input
					placeholder='Password'
					type='password'
					secureTextEntry
					value={password}
					onChangeText={(text) => setPassword(text)}
				/>
				<Input
					placeholder='Profile Picture Url (optional)'
					type='text'
					value={imgUrl}
					onChangeText={(text) => setImgUrl(text)}
					onSubmitEditing={register}
				/>
			</View>
			<Button
				onPress={register}
				title='Register'
				raised
				containerStyle={styles.button}
			/>
		</KeyboardAvoidingView>
	);
};

export default RegisterScreen;

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: 'center' },
	button: { width: 200, marginTop: 10 },
	inputContainer: { width: 300 },
});
