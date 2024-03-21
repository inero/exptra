import NewCategory from "../pages/NewCategory";
import NewExpense from "../pages/NewExpense";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const NewExpenseStack = () => (
	<Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
		<Stack.Screen
			name="NewExpense"
			component={NewExpense}
			options={{ title: "New Expense" }}
		/>
		<Stack.Screen
			name="NewCategory"
			component={NewCategory}
			options={{ title: "New Category" }}
		/>
	</Stack.Navigator>
);

export default NewExpenseStack;
