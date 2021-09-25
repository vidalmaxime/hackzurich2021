import React, { useState } from 'react';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	FlatList,
	SafeAreaView,
} from 'react-native';
import uuid from 'react-native-uuid';

const SummaryInfo = ({ data, origin }) => {
	const [showTranscript, setShowTranscript] = useState(false);

	function onPress() {
		setShowTranscript((prev) => !prev);
	}

	if (data.dataApi) {
		const dataApi = JSON.parse(data.dataApi);
		const keywords = dataApi.keywords;
		const transcript = dataApi.transcript;

		return (
			<View>
				<TouchableOpacity activeOpacity={0.5} onPress={onPress}>
					<SafeAreaView
						style={
							origin === 'receiver'
								? styles.apiSummaryContainerReceiver
								: styles.apiSummaryContainerSender
						}
					>
						<FlatList
							style={styles.flatlist}
							data={keywords.slice(0, 5)}
							renderItem={({ item }) => (
								<View style={{ flex: 1, flexDirection: 'column', margin: 1 }}>
									<Text style={styles.keyword}> #{item}</Text>
								</View>
							)}
							//Setting the number of column
							numColumns={3}
							keyExtractor={() => uuid.v4()}
						/>
					</SafeAreaView>
				</TouchableOpacity>
				{showTranscript && (
					<View
						style={
							origin === 'receiver'
								? styles.apiSummaryContainerReceiver
								: styles.apiSummaryContainerSender
						}
					>
						<Text style={styles.apiTranscript}> {transcript} </Text>
					</View>
				)}
			</View>
		);
	} else {
		return (
			<View
				style={
					origin === 'receiver'
						? styles.apiLoadingContainerReceiver
						: styles.apiLoadingContainerSender
				}
			>
				<Text style={styles.apiSummaryLoading}> Loading... </Text>
			</View>
		);
	}
};

export default SummaryInfo;

const styles = StyleSheet.create({
	apiSummaryContainerReceiver: {
		flexDirection: 'row',
		width: '80%',
		padding: '2%',
		margin: '5%',
		marginTop: 0,
		alignSelf: 'flex-start',

		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		borderRadius: 30,

		// iOS only
		shadowOffset: {
			width: 2,
			height: 2,
		},
		shadowColor: 'black',
		shadowOpacity: 1,
	},
	apiSummaryContainerSender: {
		flexDirection: 'row-reverse',
		width: '80%',
		padding: '2%',
		margin: '5%',
		marginTop: 0,
		alignSelf: 'flex-end',

		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		borderRadius: 30,

		// iOS only
		shadowOffset: {
			width: 2,
			height: 2,
		},
		shadowColor: 'black',
		shadowOpacity: 1,
	},

	apiLoadingContainerSender: {
		flexDirection: 'row-reverse',
		width: '30%',
		padding: '5%',
		margin: '5%',
		marginTop: 0,
		alignSelf: 'flex-end',
		justifyContent: 'center',

		backgroundColor: 'rgba(0, 0, 0, 0.2)',
		borderRadius: 30,

		// iOS only
		shadowOffset: {
			width: 2,
			height: 2,
		},
		shadowColor: 'black',
		shadowOpacity: 1,
	},

	apiLoadingContainerReceiver: {
		flexDirection: 'row',
		width: '30%',
		padding: '5%',
		margin: '5%',
		marginTop: 0,
		alignSelf: 'flex-start',
		justifyContent: 'center',

		backgroundColor: 'rgba(0, 0, 0, 0.35)',
		borderRadius: 30,

		// iOS only
		shadowOffset: {
			width: 2,
			height: 2,
		},
		shadowColor: 'black',
		shadowOpacity: 1,
	},

	apiSummary: {
		color: 'white',
	},

	apiTranscript: {
		color: 'white',
	},

	apiSummaryLoading: {
		color: 'white',
	},

	keyword: {
		color: '#4158D0',
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		textAlign: 'center',
	},
});
