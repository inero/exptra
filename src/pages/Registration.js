import {
	Keyboard,
	KeyboardAvoidingView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { firebase } from "../../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { StatusBar } from "expo-status-bar";
import { showMessage } from "react-native-flash-message";
import { useState } from "react";

const auth = firebase.getAuth();

const Registration = ({ navigation }) => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");

	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");

	const register = async () => {
		if (username.length === 0) {
			showMessage({
				message: "Please enter a username",
				type: "danger",
			});
			return;
		}

		if (username !== username.trim()) {
			showMessage({
				message: "Please do not enter spaces for your username",
				type: "danger",
			});
			return;
		}

		if (password !== passwordConfirmation) {
			showMessage({
				message: "Passwords do not match",
				type: "danger",
			});
			return;
		}

		createUserWithEmailAndPassword(auth, email, password)
			.then(async (userCredential) => {
				const user = userCredential.user;
				await updateProfile(user, { displayName: username });
				navigation.navigate('AuthenticatedTab', { screen: 'Dashboard'});
			})
			.catch((e) => {
				showMessage({ message: e.message, type: "danger" });
			});
	};

	return (
		<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={undefined}>
				<Text style={styles.title}>Registration</Text>

				<View style={styles.form}>
					<View style={styles.input}>
						<TextInput
							style={{ height: 50 }}
							placeholder="Name"
							onChangeText={setUsername}
							maxLength={20}
						/>
					</View>

					<View style={styles.input}>
						<TextInput
							style={{ height: 50 }}
							placeholder="Email"
							onChangeText={setEmail}
							keyboardType={"email-address"}
							maxLength={50}
						/>
					</View>

					<View style={styles.input}>
						<TextInput
							style={{ height: 50 }}
							placeholder="Password"
							secureTextEntry={true}
							onChangeText={setPassword}
							maxLength={50}
						/>
					</View>

					<View style={styles.input}>
						<TextInput
							style={{ height: 50 }}
							placeholder="Confirm password"
							secureTextEntry={true}
							onChangeText={setPasswordConfirmation}
							maxLength={50}
						/>
					</View>

					<Text style={{ paddingLeft: 10 }}>
						By registering, you accept our{" "} <Text style={styles.link}>Terms of Service</Text>.
					</Text>

					<TouchableOpacity
						onPress={() => {
							register();
						}}>
						<View style={styles.button}>
							<Text style={styles.buttonText}>Register</Text>
						</View>
					</TouchableOpacity>
					
					<TouchableOpacity>
						<Text
							style={[styles.link, styles.already]}
							onPress={() => navigation.navigate("Login")}>
							Already have an account ?
						</Text>
					</TouchableOpacity>
				</View>

				<StatusBar style="auto" />
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		paddingTop: 100,
	},

	title: {
		fontSize: 30,
		fontWeight: "600",
	},

	form: {
		alignSelf: "stretch",
		marginTop: 32,
		marginLeft: 16,
		marginRight: 16,
	},

	input: {
		justifyContent: "center",
		backgroundColor: "#F6F6F6",
		height: 50,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#E8E8E8",
		borderRadius: 8,
	},

	button: {
		marginTop: 32,
		alignItems: "center",
		paddingTop: 16,
		paddingBottom: 16,
		borderRadius: 100,
		backgroundColor: "#74CA8D",
	},

	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},

	link: {
		color: "blue",
		textDecorationLine: "underline",
	},

	already: {
		marginTop: 20,
		alignSelf: "center",
	},
});

export default Registration;
