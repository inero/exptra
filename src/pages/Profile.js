import {
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebase, db } from "../../firebase";
import { updateProfile } from "firebase/auth";
import Dialog from "react-native-dialog";
import Ionicons from "react-native-vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import { showMessage } from "react-native-flash-message";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useState, useEffect } from "react";
import { doc, Timestamp, collection, limit, orderBy, query, updateDoc } from "firebase/firestore";
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";


const Profile = () => {
	const auth = firebase.getAuth();
	const user = auth.currentUser;

	const [modalVisible, setModalVisible] = useState(false);
	const [nickname, setNickname] = useState(user.displayName);
	const [budgetModalVisible, setBudgetModalVisible] = useState(false);
	const [budget2, setBudget] = useState(0);
	
	const userInfo = useCollectionData(doc(db, "users", user.uid));
	
	const writeBudget = async (value) => {
		if (value.trim().length === 0) {
			showMessage({
				message: "Please enter the budget",
				type: "danger",
			});
		}
		if (value.length > 8) {
			showMessage({
				message: "Please enter budget amount less than or equal to 8 digits",
				type: "danger",
			});
			return;
		}
		await updateDoc(doc(db, "users", auth.currentUser.uid), {
			budget: value,
		});
		// await AsyncStorage.setItem('@budget',budget);
		setBudget(value);
		setBudgetModalVisible(!budgetModalVisible)
	};

	const changeNickname = async (nickname) => {
		if (nickname.trim().length === 0) {
			showMessage({
				message: "Please enter a nickname",
				type: "danger",
			});
			return;
		}

		if (nickname !== nickname.trim()) {
			showMessage({
				message:
					"Please do not enter spaces for your username",
				type: "danger",
			});
			return;
		}

		if (nickname.length > 20) {
			showMessage({
				message: "Your nickname must not exceed 20 characters",
				type: "danger",
			});
			return;
		}
		await updateProfile(auth.currentUser, {
			displayName: nickname,
		});
		await updateDoc(doc(db, "users", auth.currentUser.uid), {
			username: nickname,
		});
		setNickname(nickname);
	};

	const handleSignOut = async () => {
		auth
			.signOut()
			.then(async () => {
				await AsyncStorage.clear();
				navigation.replace("Home");
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const { showActionSheetWithOptions } = useActionSheet(); // Menu changer photo

	return (
		<View style={styles.container}>
			<TouchableOpacity
				onPress={() => {
					showActionSheetWithOptions(
						{
							options: ["Change profile picture", "Close"],
							cancelButtonIndex: 1,
						},
						async (index) => {
							if (index === 0) {
								//changerPhoto();
							}
						}
					);
				}}>
				<View style={styles.profileImage}>
					<Image
						source={require("../../assets/exptra-logo.png")}
						style={styles.image}
						resizeMode="cover"
					/>
				</View>
			</TouchableOpacity>

			<View>
				<Text style={styles.username}>Hello, {nickname}</Text>
			</View>

			<View style={styles.menu}>
				<TouchableOpacity onPress={() => setModalVisible(true)}>
					<View style={[styles.menuAction, styles.menuActionBorder]}>
						<Ionicons name="airplane" style={styles.menuIcon} size={15} />
						<Text style={styles.menuText}>Change nickname</Text>
					</View>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => setBudgetModalVisible(true)}>
					<View style={[styles.menuAction, styles.menuActionBorder]}>
						<Ionicons
							name="settings-outline"
							style={styles.menuIcon}
							size={15}
						/>
						<Text style={styles.menuText}>Change budget</Text>
					</View>
				</TouchableOpacity>

				<TouchableOpacity onPress={handleSignOut}>
					<View style={styles.menuAction}>
						<Ionicons
							name="log-out-outline"
							style={styles.menuIcon}
							size={15}
						/>
						<Text style={styles.menuText}>Logout</Text>
					</View>
				</TouchableOpacity>
			</View>

			<Dialog.Container
				visible={modalVisible}
				onBackdropPress={() => {
					setModalVisible(false);
				}}>
				<Dialog.Title>Change nickname</Dialog.Title>
				<Dialog.Input
					value={nickname}
					placeholder="New nickname"
					style={styles.dialogInput}
					onChangeText={setNickname}
					maxLength={20}
				/>
				<Dialog.Button
					label="Close"
					onPress={() => setModalVisible(false)}
				/>
				<Dialog.Button
					label="Confirm"
					onPress={() => {
						changeNickname(nickname);
						setModalVisible(!modalVisible);
					}}
				/>
			</Dialog.Container>

			{budgetModalVisible && (<Dialog.Container
				visible={budgetModalVisible}
				onBackdropPress={() => {
					setBudgetModalVisible(false);
				}}>
				<Dialog.Title>Set Budget</Dialog.Title>
				<Dialog.Input
					value={budget2}
					placeholder="Budget"
					style={styles.dialogInput}
					onChangeText={setBudget}
					maxLength={20}
					keyboardType={"numeric"}
				/>
				<Dialog.Button
					label="Close"
					onPress={() => setBudgetModalVisible(false)}
				/>
				<Dialog.Button
					label="Confirm"
					onPress={() => writeBudget(budget2)}
				/>
			</Dialog.Container>)}

			<StatusBar style="auto" />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#5DB075",
	},

	username: {
		marginTop: 10,
		color: "white",
		fontSize: 26,
		fontWeight: "300",
	},

	image: {
		flex: 1,
		height: undefined,
		width: undefined,
	},

	profileImage: {
		width: 250,
		height: 250,
		// borderRadius: 250,
		overflow: "hidden",
	},

	menu: {
		marginTop: 35,
		alignSelf: "stretch",
		marginLeft: 30,
		marginRight: 30,
		paddingTop: 5,
		paddingBottom: 5,
		borderWidth: 1,
		borderRadius: 7,
		borderColor: "#E8E8E8",
		backgroundColor: "white",
	},

	menuAction: {
		flexDirection: "row",
		alignSelf: "stretch",
		alignItems: "center",
		marginLeft: 20,
		marginRight: 20,
		paddingTop: 15,
		paddingBottom: 15,
	},

	menuActionBorder: {
		borderBottomWidth: 1,
		borderBottomColor: "#E8E8E8",
	},

	menuIcon: {
		marginLeft: 15,
		marginRight: 15,
	},

	menuText: {
		fontSize: 16,
		fontWeight: "500",
	},

	dialogInput: {
		color: 'black',
	}
});

export default Profile;
