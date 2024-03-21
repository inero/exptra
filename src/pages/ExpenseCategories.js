import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SwipeListView } from "react-native-swipe-list-view";
import { useDispatch, useSelector } from 'react-redux';
import { deleteExpense } from "../redux/actions";


const parseDateString = (dateString) => {
	const parts = dateString.split('/');
	return new Date(parts[2], parts[1] - 1, parts[0]);
};

const ExpenseCategories = ({ navigation, route }) => {
	const dispatch = useDispatch();
	const expList = useSelector((state) => state.expenses);
	const expenses = expList.filter(exp => parseInt(exp.category) === parseInt(route.params.categoryId));
	const reportMonth = parseInt(route.params.monthId);

	const renderExpense = ({ item }) => (
		<View style={styles.expense} key={item.id}>
			<Text style={{ flex: 1, fontSize: 16, paddingLeft: 10 }}>{item.name}</Text>
			<View
				style={{
					flex: 1,
					flexDirection: "row",
					justifyContent: "space-between",
				}}>
				<Text style={{ fontSize: 16 }}>{item.date}</Text>
				<Text style={{ fontSize: 16, paddingRight: 10 }}>{item.amount} ₹</Text>
			</View>
		</View>
	);

	const renderSwipeButtons = (data, map) => (
		<View style={styles.swipeButtons} key={data.item.id}>
			<TouchableOpacity
				style={[styles.backButton, styles.backButtonRL]}
				onPress={() => map[data.item.id].closeRow()}>
				<Text style={{ color: "white" }}>Close</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.backButton, styles.backButtonRR]}
				onPress={() => deleteExpenseRecord(data.item.id)}>
				<Ionicons name="trash-outline" color={"#FFF"} size={28} />
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.backButton, styles.backButtonL]}
				onPress={() => {
					map[data.item.id].closeRow();
					navigation.navigate("EditExpense", {
						expense: data.item.id,
						title: data.item.name,
					});
				}}>
				<Ionicons name="create-outline" color={"#FFF"} size={28} />
			</TouchableOpacity>
		</View>
	);

	const deleteExpenseRecord = id => {
		dispatch(deleteExpense({ id }))
	};

	return (
		<View style={styles.container}>
			<View style={styles.expenses}>
				{expenses && expenses.length === 0 && (
					<View style={{ marginTop: 20 }}>
						<Text style={{ alignSelf: "center" }}>
							You have no expenses in this category. What if you add one?
						</Text>
					</View>
				)}

				{expenses && expenses.length > 0 && (
					<SwipeListView
						useFlatList={true}
						data={[...expenses].filter((expense) => parseDateString(expense.date).getMonth() === reportMonth).sort((a, b) => a.name > b.name)}
						renderItem={renderExpense}
						renderHiddenItem={renderSwipeButtons}
						keyExtractor={(item) => item.id}
						leftOpenValue={75}
						rightOpenValue={-150}
					/>
				)}
			</View>

			<StatusBar style="auto" />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},

	expenses: {
		flex: 1,
		alignSelf: "stretch",
	},

	expense: {
		flexDirection: "row",
		justifyContent: "space-between",
		borderBottomWidth: 1,
		borderBottomColor: "#E8E8E8",
		paddingTop: 16,
		paddingBottom: 16,
		backgroundColor: "white",
	},

	swipeButtons: {
		alignItems: "center",
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingLeft: 15,
	},

	backButton: {
		alignItems: "center",
		bottom: 0,
		justifyContent: "center",
		position: "absolute",
		top: 0,
		width: 75,
	},

	backButtonL: {
		backgroundColor: "orange",
	},

	backButtonRL: {
		backgroundColor: "blue",
		right: 75,
	},

	backButtonRR: {
		backgroundColor: "red",
		right: 0,
	},
});

export default ExpenseCategories;
