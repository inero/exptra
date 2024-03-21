import Expenses from "../pages/Expenses";
import ExpenseCategories from "../pages/ExpenseCategories";
import EditCategory from "../pages/EditCategory";
import EditExpense from "../pages/EditExpense";
import NewCategory from "../pages/NewCategory";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const ExpensesStack = () => (
	<Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
		<Stack.Screen
			name="Expenses"
			component={Expenses}
			options={{ title: "Expenses" }}
		/>

		<Stack.Screen
			name="EditCategory"
			component={EditCategory}
			options={({ route }) => ({ title: route.params.title })}
		/>

		<Stack.Screen
			name="ExpenseCategories"
			component={ExpenseCategories}
			options={({ route }) => ({ title: route.params.title })}
		/>

		<Stack.Screen
			name="EditExpense"
			component={EditExpense}
			options={({ route }) => ({ title: route.params.title })}
		/>

		<Stack.Screen
			name="NewCategory"
			component={NewCategory}
			options={{ title: "New Category" }}
		/>
	</Stack.Navigator>
);

export default ExpensesStack;
