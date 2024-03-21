import { FlatList, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebase } from "../../firebase";
import GaugeExpenses from "../components/GaugeExpenses";
import { StatusBar } from "expo-status-bar";
import Dialog from "react-native-dialog";
import { useState } from "react";
import { useSelector } from 'react-redux';
import Ionicons from "react-native-vector-icons/Ionicons";
import { updateProfile } from "firebase/auth";


const parseDateString = (dateString) => {
	const parts = dateString.split('/');
	return new Date(parts[2], parts[1] - 1, parts[0]);
};

const auth = firebase.getAuth();

const Dashboard = () => {
	const [modalVisible, setModalVisible] = useState(false);
	const [budget, setBudget] = useState(auth?.currentUser?.photoURL);
	const [reportMonth] = useState(parseInt(new Date().getMonth() + 1));

	const expenses = useSelector((state) => state.expenses);
	const categories = useSelector((state) => state.categories);

	const writeBudget = async (value) => {
		await AsyncStorage.setItem(
			'@budget',
			budget,
		);

		if (value !== null) {
			updateProfile(auth.currentUser, {
				photoURL: value
			}).then(() => {
				setBudget(value);
			}).catch((error) => {
				showMessage({
					message: "Something went wrong! try again later..",
					type: "danger",
				});
			});
		}
	};

	const expensesTotal = () => {
		return expenses.filter((exp) => {
			const dte = parseDateString(exp.date).getMonth() + 1;
			const thisMonth = new Date().getMonth() + 1;
			if (dte === thisMonth) return exp;
		}).reduce((total, exp) => parseInt(total) + parseInt(exp.amount), 0);
	};

	const exp = expenses ? expensesTotal() : 0;
	const max = budget;
	const percentage = expenses && expenses.length > 0
		? Math.round((expensesTotal() / budget) * 100)
		: 0;

	const latestExpenses = [...expenses].filter((exp) => {
		const dte = parseDateString(exp.date).getMonth() + 1;
		const thisMonth = new Date().getMonth() + 1;
		if (dte === thisMonth) return exp;
	});


	const renderExpense = ({ item }) => {
		const catName = categories.find((cat) => {
			if (cat.id === parseInt(item.category)) return cat;
		})
		return (
			<View style={styles.item}>
				<Ionicons name={catName?.icon} style={styles.icon} size={35} />
				<View style={styles.details}>
					<Text style={styles.name}>{item.name}</Text>
					<Text style={styles.description}>{item.date}</Text>
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
				<GaugeExpenses exp={exp} max={max} percentage={percentage} month={reportMonth} />
				{(exp > max) &&
					(<TouchableOpacity onPress={() => setModalVisible(true)}>
						<View style={styles.budgetContainer}>
							<Text style={styles.setBudget}>Set budget</Text>
						</View>
					</TouchableOpacity>)
				}
				{/* <Dialog.Container
					visible={modalVisible}
					onBackdropPress={() => {
						setModalVisible(false);
					}}>
					<Dialog.Title>Set Budget</Dialog.Title>
					<Dialog.Input
						value={budget}
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
				</Dialog.Container> */}
			</View>

			<View style={styles.semi}>
				<View style={styles.latestExpenses}>
					<Text style={styles.title}>Recent expenses</Text>

					{latestExpenses && (
						<FlatList
							style={styles.listExpenses}
							data={latestExpenses}
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
