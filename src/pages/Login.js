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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { showMessage } from "react-native-flash-message";
import { useState, useEffect, useRef } from "react";
import { firebase } from "../../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from 'expo-linear-gradient';

const Login = ({ navigation }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;

	const auth = firebase.getAuth();

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
				message: "Please fill all fields",
				type: "danger",
				duration: 3000,
			});
			return;
		}
		if (email !== email.trim()) {
			showMessage({
				message: "Please do not enter spaces in email",
				type: "danger",
				duration: 3000,
			});
			return;
		}

		setLoading(true);
		const auth = firebase.getAuth();
		firebase.signInWithEmailAndPassword(auth, email, password)
			.then(async (userCredential) => {
				const user = userCredential.user;
				if (!user.emailVerified) {
					navigation.navigate("EmailValidation");
				}
				await AsyncStorage.setItem('@loggedIn', 'yes');
				setLoading(false);
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
				colors={['#667eea', '#764ba2']}
				style={styles.gradient}>
				<KeyboardAvoidingView
					style={styles.container}
					behavior={Platform.OS === "ios" ? "padding" : "height"}>
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
								<Ionicons name="wallet" size={60} color="#fff" />
							</View>
							<Text style={styles.title}>Welcome Back</Text>
							<Text style={styles.subtitle}>Sign in to continue</Text>
						</View>

						<View style={styles.form}>
							<View style={styles.inputContainer}>
								<Ionicons name="mail-outline" size={20} color="#667eea" style={styles.inputIcon} />
								<TextInput
									style={styles.input}
									placeholder="Email"
									placeholderTextColor="#999"
									onChangeText={setEmail}
									value={email}
									keyboardType="email-address"
									autoCapitalize="none"
								/>
							</View>

							<View style={styles.inputContainer}>
								<Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
								<TextInput
									style={styles.input}
									placeholder="Password"
									placeholderTextColor="#999"
									secureTextEntry={!showPassword}
									onChangeText={setPassword}
									value={password}
								/>
								<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
									<Ionicons 
										name={showPassword ? "eye-outline" : "eye-off-outline"} 
										size={20} 
										color="#999" 
									/>
								</TouchableOpacity>
							</View>

							<TouchableOpacity onPress={() => navigation.navigate("Forgot")}>
								<Text style={styles.forgot}>Forgot password?</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.button}
								onPress={() => login(email, password)}
								disabled={loading}>
								{loading ? (
									<ActivityIndicator color="#fff" />
								) : (
									<Text style={styles.buttonText}>Sign In</Text>
								)}
							</TouchableOpacity>

							<View style={styles.signupContainer}>
								<Text style={styles.signupText}>Don't have an account? </Text>
								<TouchableOpacity onPress={() => navigation.navigate("Registration")}>
									<Text style={styles.signupLink}>Sign Up</Text>
								</TouchableOpacity>
							</View>
						</View>
					</Animated.View>
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

	content: {
		flex: 1,
		justifyContent: 'center',
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

	forgot: {
		color: '#fff',
		fontSize: 14,
		textAlign: 'right',
		marginBottom: 24,
		fontWeight: '500',
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
		color: '#667eea',
		fontSize: 18,
		fontWeight: 'bold',
	},

	signupContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},

	signupText: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: 14,
	},

	signupLink: {
		color: '#fff',
		fontSize: 14,
		fontWeight: 'bold',
	},
});

export default Login;
