import { FlatList, StyleSheet, Text, View, TouchableOpacity, Animated, RefreshControl } from "react-native";
import { firebase, db } from "../../firebase";
import GaugeExpenses from "../components/GaugeExpenses";
import { StatusBar } from "expo-status-bar";
import Dialog from "react-native-dialog";
import { useState, useEffect, useRef } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { getDocs, collection, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { monthNames } from "../utils/Months";
import { LinearGradient } from 'expo-linear-gradient';
import { showMessage } from "react-native-flash-message";

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
	const [refreshing, setRefreshing] = useState(false);

	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(30)).current;

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
			setRefreshing(false);
			setTimeout(() => {
				setInitializing(true);
			}, 0);
		});
	};

	useEffect(() => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 600,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 600,
				useNativeDriver: true,
			}),
		]).start();
		
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
				duration: 3000,
			});
			return;
		}
		if (value.length > 8) {
			showMessage({
				message: "Please enter budget amount less than or equal to 8 digits",
				type: "danger",
				duration: 3000,
			});
			return;
		}
		await updateDoc(doc(db, "users", auth.currentUser.uid), {
			budget: parseInt(value),
		});
		setBudget(parseInt(value));
		showMessage({
			message: "Budget updated successfully",
			type: "success",
			duration: 2000,
		});
	};

	const onRefresh = () => {
		setRefreshing(true);
		getBudget();
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

	const renderExpense = ({ item, index }) => {
		const catName = categories.find((cat) => {
			if (cat.id === item.category) return cat;
		})
		return (
			<Animated.View 
				style={[
					styles.expenseCard,
					{
						opacity: fadeAnim,
						transform: [
							{ 
								translateX: slideAnim.interpolate({
									inputRange: [0, 30],
									outputRange: [0, 30],
								})
							}
						],
					}
				]}>
				<View style={styles.expenseIconContainer}>
					<Ionicons name={catName?.icon} size={28} color="#667eea" />
				</View>
				<View style={styles.expenseDetails}>
					<Text style={styles.expenseName}>{item.name}</Text>
					<Text style={styles.expenseDate}>{parseDateString(item.date)}</Text>
				</View>
				<View style={styles.amountContainer}>
					<Text style={styles.expenseAmount}>Rs.{item.amount}</Text>
				</View>
			</Animated.View>
		)
	};

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#667eea', '#764ba2']}
				style={styles.headerGradient}>
				<StatusBar style="light" />
				<View style={styles.headerContent}>
					<Text style={styles.greeting}>Hello, {user?.displayName || 'User'}!</Text>
					<Text style={styles.headerSubtitle}>Track your expenses</Text>
				</View>
			</LinearGradient>

			<View style={styles.gaugeContainer}>
				{initializing && <GaugeExpenses exp={exp} max={max} percentage={percentage} month={reportMonth} />}
				{(budget === 0 || exp > max) &&
					(<TouchableOpacity 
						style={styles.setBudgetButton}
						onPress={() => setModalVisible(true)}>
						<Ionicons name="wallet-outline" size={20} color="#667eea" />
						<Text style={styles.setBudgetText}>Set Monthly Budget</Text>
					</TouchableOpacity>)
				}
			</View>

			<View style={styles.expensesSection}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>{`${monthNames[reportMonth - 1]} Expenses`}</Text>
					<TouchableOpacity onPress={onRefresh}>
						<Ionicons name="refresh" size={24} color="#667eea" />
					</TouchableOpacity>
				</View>

				{latestExpenses && (
					<FlatList
						style={styles.expensesList}
						data={latestExpenses.filter((exp) => {
							const d = exp.date.toDate();
							d.setMilliseconds(0);
							return d > p && d < n;
						})}
						renderItem={renderExpense}
						keyExtractor={(_item, index) => index.toString()}
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />
						}
						ListEmptyComponent={() => (
							<View style={styles.emptyState}>
								<Ionicons name="receipt-outline" size={64} color="#ccc" />
								<Text style={styles.emptyText}>No expenses yet</Text>
								<Text style={styles.emptySubtext}>Start tracking your expenses!</Text>
							</View>
						)}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>

			{modalVisible && (
				<Dialog.Container
					visible={modalVisible}
					onBackdropPress={() => setModalVisible(false)}>
					<Dialog.Title>Set Monthly Budget</Dialog.Title>
					<Dialog.Description>
						Enter your monthly budget to track expenses
					</Dialog.Description>
					<Dialog.Input
						value={budget.toString()}
						placeholder="Enter amount"
						onChangeText={setBudget}
						maxLength={8}
						keyboardType="numeric"
					/>
					<Dialog.Button
						label="Cancel"
						onPress={() => setModalVisible(false)}
					/>
					<Dialog.Button
						label="Save"
						bold
						onPress={() => {
							writeBudget(budget);
							setModalVisible(false);
						}}
					/>
				</Dialog.Container>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},

	headerGradient: {
		paddingTop: 60,
		paddingBottom: 30,
		paddingHorizontal: 20,
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
	},

	headerContent: {
		marginBottom: 10,
	},

	greeting: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 4,
	},

	headerSubtitle: {
		fontSize: 16,
		color: 'rgba(255, 255, 255, 0.9)',
	},

	gaugeContainer: {
		marginTop: -20,
		marginHorizontal: 20,
		backgroundColor: '#fff',
		borderRadius: 20,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
		alignItems: 'center',
	},

	setBudgetButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f0f4ff',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 12,
		marginTop: 15,
	},

	setBudgetText: {
		fontSize: 16,
		color: '#667eea',
		fontWeight: '600',
		marginLeft: 8,
	},

	expensesSection: {
		flex: 1,
		marginTop: 20,
		paddingHorizontal: 20,
	},

	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},

	sectionTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#333',
	},

	expensesList: {
		flex: 1,
	},

	expenseCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
	},

	expenseIconContainer: {
		width: 50,
		height: 50,
		borderRadius: 12,
		backgroundColor: '#f0f4ff',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},

	expenseDetails: {
		flex: 1,
	},

	expenseName: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
	},

	expenseDate: {
		fontSize: 13,
		color: '#999',
	},

	amountContainer: {
		backgroundColor: '#f0fdf4',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
	},

	expenseAmount: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#16a34a',
	},

	emptyState: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 60,
	},

	emptyText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#666',
		marginTop: 16,
	},

	emptySubtext: {
		fontSize: 14,
		color: '#999',
		marginTop: 8,
	},
});

export default Dashboard;
