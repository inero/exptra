import { FlatList, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { firebase, db } from "../../firebase";
import GaugeExpenses from "../components/GaugeExpenses";
import { StatusBar } from "expo-status-bar";
import Dialog from "react-native-dialog";
import { useState, useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { getDocs, collection, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { monthNames } from "../utils/Months";

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

const Dashboard = ({ navigation }) => {
	const auth = firebase.getAuth();
	const user = auth.currentUser;

	const [modalVisible, setModalVisible] = useState(false);
	const [budget, setBudget] = useState('0');
	const [reportMonth] = useState(parseInt(new Date().getMonth() + 1));
	const [initializing, setInitializing] = useState(true);

	const [categories] = useCollectionData(
		query(collection(db, "users", user.uid, "categories"))
	);

	const [expenses] = useCollectionData(
		query(collection(db, "users", user.uid, "expenses"))
	);

	const getBudget = async () => {
		await getDocs(collection(db, "users"), user.uid).then(snapshot => {
			const newData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
			setBudget(newData[0].budget);
			setInitializing(false);
			setTimeout(() => {
				setInitializing(true);
			}, 0);
		});
	};

	useEffect(() => {
			getBudget();
	}, []);
	
	useEffect(() => {
		const unsubscribe = navigation.addListener('tabPress', (e) => {
			getBudget();
		});
		return unsubscribe;
	}, [navigation]);

	const writeBudget = async (value) => {
		if (value.trim().length === 0) {
			showMessage({
				message: "Please enter the budget",
				type: "danger",
			});
		}
		if (value.length > 8) {
			showMessage({
				message: "Please enter budget amount less than or equal to 8 digits",
				type: "danger",
			});
			return;
		}
		await updateDoc(doc(db, "users", auth.currentUser.uid), {
			budget: parseInt(value),
		});
		setBudget(parseInt(value));
	};

	const expensesTotal = () => {
		return expenses.filter((exp) => {
			const d = exp.date.toDate();
			d.setMilliseconds(0);
			return d > p && d < n;
		}).reduce((total, exp) => parseInt(total) + parseInt(exp.amount), 0);
	};

	const exp = expenses ? expensesTotal() : 0;
	const max = parseInt(budget);
	const percentage = expenses && expenses.length > 0
		? Math.round((expensesTotal() / parseInt(budget)) * 100)
		: 0;

	const [latestExpenses] = useCollectionData(
		query(
			collection(db, "users", user.uid, "expenses"),
			orderBy("date", "desc"),
		)
	);

	const renderExpense = ({ item }) => {
		const catName = categories.find((cat) => {
			if (cat.id === item.category) return cat;
		})
		return (
			<View style={styles.item}>
				<Ionicons name={catName?.icon} style={styles.icon} size={35} />
				<View style={styles.details}>
					<Text style={styles.name}>{item.name}</Text>
					<Text style={styles.description}>{parseDateString(item.date)}</Text>
				</View>
				<Text style={styles.amount}>{item.amount} ₹</Text>
			</View>
		)
	};

	return (
		<View style={styles.container}>
			<View
				style={[
					styles.semi,
					{
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#2a3e48",
					},
				]}>
				{initializing && <GaugeExpenses exp={exp} max={max} percentage={percentage} month={reportMonth} />}
				{(budget === 0 && exp > max) &&
					(<TouchableOpacity onPress={() => setModalVisible(true)}>
						<View style={styles.budgetContainer}>
							<Text style={styles.setBudget}>Set budget</Text>
						</View>
					</TouchableOpacity>)
				}
				{modalVisible && (<Dialog.Container
					visible={modalVisible}
					onBackdropPress={() => {
						setModalVisible(false);
					}}>
					<Dialog.Title style={{ color: 'black' }}>Set Budget</Dialog.Title>
					<Dialog.Input
						value={budget}
						style={{ color: 'black' }}
						placeholder="Budget"
						onChangeText={setBudget}
						maxLength={20}
						keyboardType={"numeric"}
					/>
					<Dialog.Button
						label="Close"
						onPress={() => setModalVisible(false)}
					/>
					<Dialog.Button
						label="Confirm"
						onPress={() => {
							writeBudget(budget);
							setModalVisible(!modalVisible)
						}}
					/>
				</Dialog.Container>)}
			</View>

			<View style={styles.semi}>
				<View style={styles.latestExpenses}>
					<Text style={styles.title}>{`${monthNames[reportMonth - 1]} Expenses`}</Text>

					{latestExpenses && (
						<FlatList
							style={styles.listExpenses}
							data={latestExpenses.filter((exp) => {
								const d = exp.date.toDate();
								d.setMilliseconds(0);
								return d > p && d < n;
							})}
							renderItem={renderExpense}
							keyExtractor={(_item, index) => index}
							ListEmptyComponent={() => (
								<View style={styles.container}>
									<Text>
										You have no expense. Start adding your expenses!
									</Text>
								</View>
							)}
						/>
					)}
				</View>
			</View>
			<StatusBar style="auto" />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#dceaf0",
		alignItems: "center",
		justifyContent: "center",
	},

	semi: { flex: 1, alignSelf: "stretch" },

	title: {
		fontSize: 22,
		fontWeight: "500",
		alignSelf: "flex-start",
	},

	budgetContainer: {
		marginTop: 15,
		borderWidth: 1,
		borderColor: '#E8E8E8',
		padding: 5,
	},

	setBudget: {
		fontSize: 15,
		color: '#E8E8E8',
		fontWeight: "400",
	},

	latestExpenses: {
		flex: 1,
		paddingTop: 15,
		paddingLeft: 16,
		paddingRight: 16,
	},

	listExpenses: {
		marginTop: 12,
		marginBottom: 50,
	},

	expense: {
		flexDirection: "row",
		justifyContent: "space-between",
		borderBottomWidth: 1,
		borderBottomColor: "#E8E8E8",
		paddingTop: 16,
		paddingBottom: 16,
	},

	item: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 6,
		borderBottomWidth: 1,
		borderBottomColor: '#cccccc',
	},
	icon: {
		fontSize: 35,
		marginRight: 16,
		color: 'grey',
	},
	details: {
		flex: 1,
	},
	name: {
		fontSize: 16,
		fontWeight: '500',
	},
	description: {
		fontSize: 14,
		color: '#999999',
	},
	amount: {
		fontSize: 16,
		fontWeight: '500',
		marginLeft: 16,
	},
});

export default Dashboard;
