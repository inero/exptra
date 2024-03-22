import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SwipeListView } from "react-native-swipe-list-view";
import { deleteExpense } from "../redux/actions";
import { firebase, db } from "../../firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { collection, query, where } from "firebase/firestore";

const previousMonth = () => {
	const date = new Date();
	date.setDate(0);
	date.setHours(23);
	date.setMinutes(59);
	date.setSeconds(59);
	date.setMilliseconds(999);
	return date;
};

const nextMonth = () => {
	const date = new Date();
	date.setDate(1);
	date.setMonth(date.getMonth() + 1);
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
};

function parseDateString(firestoreDate) {
	const date = new Date(firestoreDate.seconds * 1000);
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();

	return `${day}/${month}/${year}`;
}

const p = previousMonth();
const n = nextMonth();


const ExpenseCategories = ({ navigation, route }) => {
	const auth = firebase.getAuth();
	const user = auth.currentUser;

	const reportMonth = parseInt(route.params.monthId);
	const [expenses] = useCollectionData(
		query(
			collection(db, "users", user.uid, "expenses"),
			where("category", "==", route.params.categoryId)
		)
	);

	const renderExpense = ({ item }) => (
		<View style={styles.expense} key={item.id}>
			<Text style={{ flex: 1, fontSize: 16, paddingLeft: 10 }}>{item.name}</Text>
			<View
				style={{
					flex: 1,
					flexDirection: "row",
					justifyContent: "space-between",
				}}>
				<Text style={{ fontSize: 16 }}>{parseDateString(item.date)}</Text>
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
						data={[...expenses].filter((exp) => {
							const eMonth = exp.date.toDate().getMonth();
							if(eMonth === reportMonth) return exp; 
						}).sort((a, b) => a.name > b.name)}
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
