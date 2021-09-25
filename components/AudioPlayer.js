import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Audio } from 'expo-av';
import * as firebase from 'firebase';

const AudioPlayer = ({ id }) => {
	const soundObject = useRef(new Audio.Sound());
	const [playing, setPlaying] = useState(false);

	useEffect(() => {
		const downloadAudio = async (id) => {
			console.log(id);
			const uri = await firebase.storage().ref(`${id}.m4a`).getDownloadURL();

			console.log('uri:', uri);

			// The rest of this plays the audio
			try {
				await soundObject.current.loadAsync({ uri });
			} catch (error) {
				console.log('error:', error);
			}
		};
		downloadAudio(id);
	}, []);

	function startPlaying() {
		soundObject.current.playAsync();
		setPlaying(true);
	}

	function stopPlaying() {
		soundObject.current.pauseAsync();
		setPlaying(false);
	}

	return !playing ? (
		<TouchableOpacity 
			activeOpacity={0.5} 
			onPress={startPlaying}
			style={styles.audioPlayer}
		>
			<Image 
				style={styles.playButton} 
				source={require('../assets/play.png')} 
			/>
		</TouchableOpacity>
	) : (
		<TouchableOpacity activeOpacity={0.5} onPress={stopPlaying}>
			<Image
				style={styles.playButton}
				source={require('../assets/pause.png')}
			/>
		</TouchableOpacity>
	);
};

export default AudioPlayer;

const styles = StyleSheet.create({
	audioPlayer: {
		alignSelf: 'center',
	},
	
	playButton: {
		width: 40,
		height: 40,
	},
});
