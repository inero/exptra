import {
	FlatList,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import {
	Timestamp,
	addDoc,
	collection,
	deleteDoc,
	doc,
	orderBy,
	query,
	updateDoc,
} from "firebase/firestore";
import { firebase } from "../../firebase";
import {
	useCollectionData,
	useDocumentData,
} from "react-firebase-hooks/firestore";

import PropTypes from "prop-types";
// import ReactTimeAgo from "react-time-ago";
import { StatusBar } from "expo-status-bar";
import { showMessage } from "react-native-flash-message";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useState } from "react";

// Pour affichage des horaires des messages relatifs à l'heure actuelle

// function TimeAgo(props) {
// 	return <ReactTimeAgo {...props} component={Time} />;
// }

function Time({ date, verboseDate, tooltip, children, ...rest }) {
	return <Text style={styles.messageSecondary}>{children}</Text>;
}

Time.propTypes = {
	date: PropTypes.instanceOf(Date).isRequired,
	verboseDate: PropTypes.string,
	tooltip: PropTypes.bool.isRequired,
	children: PropTypes.string.isRequired,
};

const auth = firebase.getAuth();

const Chatbot = () => {
	// To disable remote chat
	const [adminMessages] = []; //useDocumentData(doc(db, "admin", "messages"));

	const user = auth?.currentUser;

	const [messages, loadingMessages, errorMessages] = [];
	// useCollectionData(
	// 	query(collection(db, "messages"), orderBy("timestamp", "asc"))
	// );

	const [users, loadingUsers, errorUsers] = [];
	// useCollectionData(
	// 	collection(db, "users")
	// );

	const [inputMessage, setInputMessage] = useState("");

	const getUsername = (uid) => {
		if (users) {
			const user = users.find((user) => user.uid === uid);
			return user ? "@" + user.username : "User deleted";
		} else {
			return "Loading...";
		}
	};

	const renderMessage = ({ item }) => {
		const options = ["Close"];

		const own = item.uid === user.uid;
		own ? options.unshift("Delete") : null;
		const destructive = own ? 1 : undefined;

		const liked = item.likes.includes(user.uid);
		liked ? options.unshift("Remove like") : options.unshift("Like");
		const cancel = liked ? 1 : 2;

		return (
			<>
				{item.likes.length > 0 && (
					<TouchableOpacity
						onPress={async () => {
							if (liked) {
								await removeLike(item.id);
							} else {
								await like(item.id);
							}
						}}>
						{!liked && (
							<View
								style={[
									styles.likes,
									{ borderColor: "white", borderWidth: 2 },
								]}>
								<Text style={styles.likesText}>💵 {item.likes.length}</Text>
							</View>
						)}
						{liked && (
							<View
								style={[
									styles.likes,
									{
										borderColor: "green",
										borderWidth: 2,
										backgroundColor: "rgba(255, 255, 255, 0.4)",
									},
								]}>
								<Text style={[styles.likesText, { color: "green" }]}>
									💵 {item.likes.length}
								</Text>
							</View>
						)}
					</TouchableOpacity>
				)}

				<TouchableOpacity
					onLongPress={() => {
						showActionSheetWithOptions(
							{
								options: options,
								destructiveButtonIndex: destructive,
								cancelButtonIndex: cancel,
							},
							async (index) => {
								if (index === 0) {
									if (liked) {
										await removeLike(item.id);
									} else {
										await like(item.id);
									}
								} else if (own && index === 1) {
									await deleteMessage(item.id);
								}
							}
						);
					}}>
					<View style={styles.message}>
						<Text style={styles.messageContent}>{item.content}</Text>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
							}}>
							<Text style={styles.messageSecondary}>
								{getUsername(item.uid)}
							</Text>
							{/* <TimeAgo date={item.timestamp.toDate()} /> */}
						</View>
					</View>
				</TouchableOpacity>
			</>
		);
	};

	const addMessage = async (message) => {
		if (message.trim().length === 0) {
			showMessage({ message: "You need to write a message", type: "danger" });
			return;
		}

		const ref = null;
		// await addDoc(collection(db, "messages"), {
		// 	content: message,
		// 	timestamp: Timestamp.now(),
		// 	uid: user.uid,
		// 	likes: [],
		// });

		await updateDoc(ref, {
			id: ref.id,
		});
	};

	const deleteMessage = async (id) => {
		//await deleteDoc(doc(db, "messages", id));
	};

	const like = async (id) => {
		const message = messages.find((message) => message.id === id);
		// await updateDoc(doc(db, "messages", message.id), {
		// 	likes: [...message.likes, user.uid],
		// });
	};

	const removeLike = async (id) => {
		const message = messages.find((message) => message.id === id);
		// await updateDoc(doc(db, "messages", message.id), {
		// 	likes: message.likes.filter((uid) => uid !== user.uid),
		// });
	};

	const { showActionSheetWithOptions } = useActionSheet();

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={undefined}>
			<View style={styles.main}>
				<Text style={styles.title}>Your advice</Text>

				{messages && (
					<FlatList
						style={styles.chat}
						inverted
						data={[...messages].reverse()}
						renderItem={renderMessage}
						keyExtractor={(item, index) => index}
					/>
				)}
			</View>

			<View style={styles.form}>
				{!adminMessages?.disabled && (
					<View style={styles.input}>
						<TextInput
							style={{ height: 50 }}
							onChangeText={setInputMessage}
							value={inputMessage}
							maxLength={200}
							placeholder="Share your experience!"
						/>
					</View>
				)}

				{adminMessages?.disabled && (
					<View style={styles.input}>
						<TextInput
							style={{ height: 50 }}
							onChangeText={setInputMessage}
							value={inputMessage}
							maxLength={200}
							placeholder="Chat disabled!"
							editable={false}
						/>
					</View>
				)}
				<Pressable
					disabled={adminMessages?.disabled}
					onPress={() => {
						addMessage(inputMessage).then(() => {
							setInputMessage("");
							Keyboard.dismiss();
						});
					}}>
					<View style={styles.button}>
						<Text style={styles.buttonText}>Send</Text>
					</View>
				</Pressable>
			</View>

			<StatusBar style="auto" />
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		backgroundColor: "#5DB075",
	},

	main: {
		flex: 10,
		alignSelf: "stretch",
		alignItems: "center",
	},

	title: {
		color: "white",
		fontSize: 30,
		fontWeight: "600",
		marginTop: 60,
	},

	chat: {
		flex: 1,
		alignSelf: "stretch",
		marginTop: 20,
	},

	message: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		marginBottom: 8,
		marginLeft: 25,
		marginRight: 25,
	},

	messageContent: {
		fontSize: 14,
	},

	messageSecondary: {
		marginTop: 5,
		color: "dimgray",
	},

	likes: {
		alignSelf: "flex-end",
		marginRight: 30,
		marginBottom: 8,
		backgroundColor: "white",
		paddingTop: 1,
		paddingBottom: 1,
		paddingLeft: 4,
		paddingRight: 4,
		borderRadius: 7,
	},

	likesText: {
		fontSize: 16,
		fontWeight: "500",
		color: "gray",
	},

	form: {
		flex: 1,
		alignSelf: "stretch",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 15,
	},

	input: {
		justifyContent: "center",
		flexGrow: 1,
		flexShrink: 1,
		height: 50,
		padding: 10,
		backgroundColor: "white",
		borderRadius: 7,
		marginLeft: 15,
	},

	button: {
		height: 50,
		padding: 10,
		borderRadius: 7,
		backgroundColor: "white",
		justifyContent: "center",
		alignItems: "center",
		marginLeft: 5,
		marginRight: 15,
	},

	buttonText: {
		fontWeight: "500",
	},

	chatbox: {
		marginBottom: 70,
	},
});

export default Chatbot;
