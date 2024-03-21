import Dashboard from "../pages/Dashboard";
import Chatbot from "../pages/Chatbot";
import ExpensesStack from "./ExpensesStack";
import Ionicons from "react-native-vector-icons/Ionicons";
import NewExpenseStack from "./NewExpenseStack";
import Profile from "../pages/Profile";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FloatingAction } from "react-native-floating-action";
import { View, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

const actions = [
	{
	  text: "New Expense",
	  icon: <Ionicons name="add-circle-outline" color={'#b3afc7'} size={25} />,
	  name: "NewExpense",
	  position: 2
	},
	{
	  text: "New Category",
	  icon: <Ionicons name="duplicate-outline" color={'#b3afc7'} size={25} />,
	  name: "NewCategory",
	  position: 1
	}
];

const AuthenticatedTab = ({ navigation }) => {
	return (
		<View style={styles.container}>
			<Tab.Navigator
				screenOptions={{
					headerTitleAlign: "center",
					tabBarActiveTintColor: "#5DB075",
					tabBarStyle: {
						height: 60
					},
					tabBarItemStyle: {
						marginBottom: 10,
					},
					tabBarLabelStyle: {
						fontWeight: '600'
					}
				}}>
				<Tab.Screen
					name="Dashboard"
					component={Dashboard}
					options={{
						headerShown: false,
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="home-outline" color={color} size={size} />
						),
					}}
				/>
				<Tab.Screen
					name="ExpensesStack"
					component={ExpensesStack}
					options={{
						headerShown: false,
						title: "Expense",
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="wallet-outline" color={color} size={size} />
						),
					}}
				/>
				<Tab.Screen
					name="NewExpenseStack"
					component={NewExpenseStack}
					options={{
						headerShown: false,
						title: "New Expense",
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="add-circle-outline" color={color} size={size} />
						),
					}}
				/>
				<Tab.Screen
					name="Chatbot"
					component={Chatbot}
					options={{
						headerShown: false,
						tabBarIcon: ({ color, size }) => (
							<Ionicons
								name="chatbubble-ellipses-outline"
								color={color}
								size={size}
							/>
						),
					}}
				/>
				<Tab.Screen
					name="Profile"
					component={Profile}
					options={{
						headerShown: false,
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="person-circle-outline" color={color} size={size} />
						),
					}}
				/>
			</Tab.Navigator>
			<FloatingAction
				actions={actions}
				distanceToEdge={{vertical: 70, horizontal: 30 }}
				actionsPaddingTopBottom={0}
				onPressItem={screen => navigation.navigate('NewExpenseStack', { screen })}
			/>
		</View>
	);
};

export default AuthenticatedTab;

const styles = StyleSheet.create({
	container: {
	  flex: 1,
	},
});
  