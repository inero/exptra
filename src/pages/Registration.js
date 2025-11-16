import {
	Keyboard,
	KeyboardAvoidingView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	Animated,
	Platform,
	ActivityIndicator,
	ScrollView,
} from "react-native";
import { firebase, db } from "../../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { StatusBar } from "expo-status-bar";
import { showMessage } from "react-native-flash-message";
import { useState, useEffect, useRef } from "react";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from 'expo-linear-gradient';

const auth = firebase.getAuth();

const Registration = ({ navigation }) => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 800,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 800,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	const register = async () => {
		if (username.length === 0) {
			showMessage({
				message: "Please enter a username",
				type: "danger",
				duration: 3000,
			});
			return;
		}

		if (username !== username.trim()) {
			showMessage({
				message: "Please do not enter spaces for your username",
				type: "danger",
				duration: 3000,
			});
			return;
		}

		if (password !== passwordConfirmation) {
			showMessage({
				message: "Passwords do not match",
				type: "danger",
				duration: 3000,
			});
			return;
		}

		if (password.length < 6) {
			showMessage({
				message: "Password must be at least 6 characters",
				type: "danger",
				duration: 3000,
			});
			return;
		}

		setLoading(true);
		createUserWithEmailAndPassword(auth, email, password)
			.then(async (userCredential) => {
				const user = userCredential.user;
				await updateProfile(user, { displayName: username });
				await setDoc(doc(db, "users", user.uid), {
					uid: user.uid,
					username,
				});
				await addDoc(collection(db, "users", user.uid, "categories"), {
					name: "Wallet",
					icon: 'wallet',
				}).then(
					async (docRef) =>
						await setDoc(
							docRef,
							{
								id: docRef.id,
							},
							{ merge: true }
						)
				);
				await addDoc(collection(db, "users", user.uid, "categories"), {
					name: "Accounts",
					icon: 'business',
				}).then(
					async (docRef) =>
						await setDoc(
							docRef,
							{
								id: docRef.id,
							},
							{ merge: true }
						)
				);
				await addDoc(collection(db, "users", user.uid, "categories"), {
					name: "Cash",
					icon: 'cash',
				}).then(
					async (docRef) =>
						await setDoc(
							docRef,
							{
								id: docRef.id,
							},
							{ merge: true }
						)
				);
				setLoading(false);
				navigation.navigate('AuthenticatedTab', { screen: 'Dashboard'});
			})
			.catch((e) => {
				setLoading(false);
				showMessage({ 
					message: e.message, 
					type: "danger",
					duration: 4000,
				});
			});
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<LinearGradient
				colors={['#f093fb', '#f5576c']}
				style={styles.gradient}>
				<KeyboardAvoidingView
					style={styles.container}
					behavior={Platform.OS === "ios" ? "padding" : "height"}>
					<ScrollView 
						contentContainerStyle={styles.scrollContent}
						showsVerticalScrollIndicator={false}>
						<Animated.View 
							style={[
								styles.content,
								{
									opacity: fadeAnim,
									transform: [{ translateY: slideAnim }],
								},
							]}>
							<View style={styles.header}>
								<View style={styles.iconContainer}>
									<Ionicons name="person-add" size={60} color="#fff" />
								</View>
								<Text style={styles.title}>Create Account</Text>
								<Text style={styles.subtitle}>Sign up to get started</Text>
							</View>

							<View style={styles.form}>
								<View style={styles.inputContainer}>
									<Ionicons name="person-outline" size={20} color="#f5576c" style={styles.inputIcon} />
									<TextInput
										style={styles.input}
										placeholder="Full Name"
										placeholderTextColor="#999"
										onChangeText={setUsername}
										value={username}
										maxLength={20}
									/>
								</View>

								<View style={styles.inputContainer}>
									<Ionicons name="mail-outline" size={20} color="#f5576c" style={styles.inputIcon} />
									<TextInput
										style={styles.input}
										placeholder="Email"
										placeholderTextColor="#999"
										onChangeText={setEmail}
										value={email}
										keyboardType="email-address"
										autoCapitalize="none"
										maxLength={50}
									/>
								</View>

								<View style={styles.inputContainer}>
									<Ionicons name="lock-closed-outline" size={20} color="#f5576c" style={styles.inputIcon} />
									<TextInput
										style={styles.input}
										placeholder="Password"
										placeholderTextColor="#999"
										secureTextEntry={!showPassword}
										onChangeText={setPassword}
										value={password}
										maxLength={50}
									/>
									<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
										<Ionicons 
											name={showPassword ? "eye-outline" : "eye-off-outline"} 
											size={20} 
											color="#999" 
										/>
									</TouchableOpacity>
								</View>

								<View style={styles.inputContainer}>
									<Ionicons name="lock-closed-outline" size={20} color="#f5576c" style={styles.inputIcon} />
									<TextInput
										style={styles.input}
										placeholder="Confirm Password"
										placeholderTextColor="#999"
										secureTextEntry={!showConfirmPassword}
										onChangeText={setPasswordConfirmation}
										value={passwordConfirmation}
										maxLength={50}
									/>
									<TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
										<Ionicons 
											name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
											size={20} 
											color="#999" 
										/>
									</TouchableOpacity>
								</View>

								<Text style={styles.termsText}>
									By registering, you accept our{" "}
									<Text style={styles.termsLink}>Terms of Service</Text>
								</Text>

								<TouchableOpacity
									style={styles.button}
									onPress={register}
									disabled={loading}>
									{loading ? (
										<ActivityIndicator color="#fff" />
									) : (
										<Text style={styles.buttonText}>Sign Up</Text>
									)}
								</TouchableOpacity>

								<View style={styles.loginContainer}>
									<Text style={styles.loginText}>Already have an account? </Text>
									<TouchableOpacity onPress={() => navigation.navigate("Login")}>
										<Text style={styles.loginLink}>Sign In</Text>
									</TouchableOpacity>
								</View>
							</View>
						</Animated.View>
					</ScrollView>
				</KeyboardAvoidingView>
				<StatusBar style="light" />
			</LinearGradient>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	gradient: {
		flex: 1,
	},

	container: {
		flex: 1,
	},

	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		paddingVertical: 40,
	},

	content: {
		paddingHorizontal: 24,
	},

	header: {
		alignItems: 'center',
		marginBottom: 40,
	},

	iconContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},

	title: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 8,
	},

	subtitle: {
		fontSize: 16,
		color: 'rgba(255, 255, 255, 0.8)',
	},

	form: {
		width: '100%',
	},

	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingHorizontal: 16,
		marginBottom: 16,
		height: 56,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},

	inputIcon: {
		marginRight: 12,
	},

	input: {
		flex: 1,
		fontSize: 16,
		color: '#333',
	},

	termsText: {
		color: 'rgba(255, 255, 255, 0.9)',
		fontSize: 12,
		textAlign: 'center',
		marginBottom: 20,
	},

	termsLink: {
		fontWeight: 'bold',
		textDecorationLine: 'underline',
	},

	button: {
		backgroundColor: '#fff',
		borderRadius: 12,
		height: 56,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 5,
		marginBottom: 20,
	},

	buttonText: {
		color: '#f5576c',
		fontSize: 18,
		fontWeight: 'bold',
	},

	loginContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},

	loginText: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: 14,
	},

	loginLink: {
		color: '#fff',
		fontSize: 14,
		fontWeight: 'bold',
	},
});

export default Registration;
