import Login from "../pages/Login";
import Registration from "../pages/Registration";
import Home from "../pages/Home";
import ForgotPassword from "../pages/ForgotPassword";
import EmailValidation from "../pages/EmailValidation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const GuestStack = () => {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name="Home"
				component={Home}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="Login"
				component={Login}
				options={{
					headerTitle: "",
					headerTransparent: true,
				}}
			/>
			<Stack.Screen
				name="Registration"
				component={Registration}
				options={{
					headerTitle: "",
					headerTransparent: true,
				}}
			/>
			<Stack.Screen
				name="Forgot"
				component={ForgotPassword}
				options={{
					headerTitle: "",
					headerTransparent: true,
				}}
			/>
			<Stack.Screen
				name="EmailValidation"
				component={EmailValidation}
				options={{
					headerTitle: "",
					headerTransparent: true,
				}}
			/>
		</Stack.Navigator>
	);
};

export default GuestStack;
