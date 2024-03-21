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
import { StatusBar } from "expo-status-bar";
import { showMessage } from "react-native-flash-message";
import { useState, useEffect } from "react";
import { firebase } from "../../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";


const Login = ({ navigation }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const auth = firebase.getAuth();

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (user) {
				navigation.goBack();
			}
		});
		return unsubscribe;
	}, []);

	const login = async (email, password) => {
		if (email.length === 0 || password.length === 0) {
			showMessage({
				message: "Please enter a username",
				type: "danger",
			});
			return;
		}
		if (email !== email.trim()) {
			showMessage({
				message: "Please do not enter spaces for your username",
				type: "danger",
			});
			return;
		}

		const auth = firebase.getAuth();
		firebase.signInWithEmailAndPassword(auth, email, password)
			.then(async (userCredential) => {
				const user = userCredential.user;
				if (!user.emailVerified) {
					navigation.navigate("EmailValidation");
				}
				await AsyncStorage.setItem('@loggedIn', 'yes');
			})
			.catch((e) => {
				showMessage({ message: e.message, type: "danger" });
			});
	};

	return (
		<TouchableWithoutFeedback onPress={null}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={undefined}>
				<Text style={styles.title}>Login</Text>

				<View style={styles.form}>
					<View style={styles.input}>
						<TextInput
							style={{ height: 50 }}
							placeholder="Email"
							onChangeText={setEmail}
							keyboardType={"email-address"}
						/>
					</View>

					<View style={styles.input}>
						<TextInput
							style={{ height: 50 }}
							placeholder="Password"
							secureTextEntry={true}
							onChangeText={setPassword}
						/>
					</View>
					<TouchableOpacity>
						<Text
							style={styles.forgot}
							onPress={() => navigation.navigate("Forgot")}>
							Forgot password?
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => {
							login(email, password);
						}}>
						<View style={styles.button}>
							<Text style={styles.buttonText}>Login</Text>
						</View>
					</TouchableOpacity>
					<TouchableOpacity>
						<Text
							style={styles.already}
							onPress={() => navigation.navigate("Registration")}>
							Don't have an account yet?
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

	already: {
		color: "blue",
		textDecorationLine: "underline",
		marginTop: 20,
		alignSelf: "center",
	},

	forgot: {
		color: "blue",
		textDecorationLine: "underline",
		marginBottom: 15,
		alignSelf: "center",
	},
});

export default Login;
