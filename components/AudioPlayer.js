import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Audio } from 'expo-av';
import * as firebase from 'firebase';

const AudioPlayer = ({ id }) => {
	const soundObject = useRef(new Audio.Sound());
	const [playing, setPlaying] = useState(false);

	// useEffect(() => {
	// 	const downloadAudio = async (id) => {
	// 		console.log(id);
	// 		const uri = await firebase.storage().ref(`${id}.m4a`).getDownloadURL();

	// 		// The rest of this plays the audio
	// 		try {
	// 			await soundObject.current.loadAsync({ uri });
	// 		} catch (error) {
	// 			console.log('error:', error);
	// 		}
	// 	};
	// 	downloadAudio(id);
	// }, []);

	function playbackStatusUpdate(playbackStatus) {
		if (playbackStatus.didJustFinish) {
			soundObject.current.setPositionAsync(0);
			setPlaying(false);
			soundObject.current.pauseAsync().catch((e) => console.log('error:', e));
		}
	}

	async function startPlaying() {
		const downloadAudio = async (id) => {
			console.log(id);
			const uri = await firebase.storage().ref(`${id}.m4a`).getDownloadURL();

			// The rest of this plays the audio
			try {
				await soundObject.current.loadAsync({ uri });
				soundObject.current.setOnPlaybackStatusUpdate(playbackStatusUpdate);
			} catch (error) {
				console.log('error:', error);
			}
		};

		const result = await soundObject.current
			.getStatusAsync()
			.catch((e) => console.log('error:', e));
		try {
			if (result.isLoaded) {
				if (result.isPlaying === false) {
					soundObject.current
						.playAsync()
						.catch((e) => console.log('error:', e));
					setPlaying(true);
				}
			} else {
				await downloadAudio(id);
				const result = await soundObject.current
					.getStatusAsync()
					.catch((e) => console.log('error:', e));
				if (result.isPlaying === false) {
					soundObject.current
						.playAsync()
						.catch((e) => console.log('error:', e));
					setPlaying(true);
				}
			}
		} catch (error) {}
	}

	async function stopPlaying() {
		try {
			const result = await soundObject.current.getStatusAsync();
			if (result.isLoaded) {
				if (result.isPlaying === true) {
					soundObject.current
						.pauseAsync()
						.catch((e) => console.log('error:', e));
					setPlaying(false);
				}
			}
		} catch (error) {}
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
