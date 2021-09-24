import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView } from 'react-native';
import { Button, Input, Image } from 'react-native-elements';
import { auth } from '../firebase';

const LoginScreen = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((authUser) => {
			if (authUser) {
				navigation.replace('Home');
			}
		});
		return unsubscribe;
	}, []);

	function login() {
		auth
			.signInWithEmailAndPassword(email, password)
			.catch((error) => alert(error.message));
	}

	return (
		<KeyboardAvoidingView behavior='padding' style={styles.container}>
			<Image
				source={require('../assets/circleLogoV0.png')}
				style={{ width: 200, height: 200 }}
			/>
			<View style={styles.inputContainer}>
				<Input
					placeholder='Email'
					autoFocus
					type='email'
					value={email}
					onChangeText={(text) => setEmail(text)}
				/>
				<Input
					placeholder='Password'
					secureTextEntry
					type='password'
					value={password}
					onChangeText={(text) => setPassword(text)}
					onSubmitEditing={login}
				/>
			</View>
			<Button title='Login' containerStyle={styles.button} onPress={login} />
			<Button
				title='Register'
				type='outline'
				containerStyle={styles.button}
				onPress={() => navigation.navigate('Register')}
			/>
		</KeyboardAvoidingView>
	);
};

export default LoginScreen;

const styles = StyleSheet.create({
	button: {
		width: 200,
		marginTop: 10,
	},
	inputContainer: {
		width: 300,
	},
	container: {
		flex: 1,
		alignItems: 'center',
		padding: 10,
	},
});
