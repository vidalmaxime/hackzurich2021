import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import AddChatScreen from './screens/AddChatScreen';
import ChatScreen from './screens/ChatScreen';

const Stack = createNativeStackNavigator();
const globalScreenOptions = {
	headerStyle: { backgroundColor: '#C7DED2' },
	headerTitleStyle: { color: 'black' },
	headerTintColor: 'white',
};

function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName='Login'
				screenOptions={globalScreenOptions}
			>
				<Stack.Screen
					options={{ title: 'Sign up' }}
					name='Login'
					component={LoginScreen}
				/>
				<Stack.Screen
					options={{
						title: 'Register',
					}}
					name='Register'
					component={RegisterScreen}
				/>
				<Stack.Screen
					options={{
						title: 'Home',
					}}
					name='Home'
					component={HomeScreen}
				/>
				<Stack.Screen
					options={{
						title: 'Add Chat',
					}}
					name='AddChat'
					component={AddChatScreen}
				/>
				<Stack.Screen
					options={{
						title: 'Chat',
					}}
					name='Chat'
					component={ChatScreen}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export default App;
