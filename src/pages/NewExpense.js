import {
	Keyboard,
	KeyboardAvoidingView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	FlatList,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import { showMessage } from "react-native-flash-message";
import { useState } from "react";
import { firebase, db } from "../../firebase";
import { Timestamp, addDoc, collection, orderBy, query, updateDoc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";


function formatDate(date) {
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();
	return `${day < 10 ? "0" + day : day}/${month < 10 ? "0" + month : month
		}/${year}`;
}

const NewExpense = ({ navigation }) => {
	const auth = firebase.getAuth();
	const user = auth.currentUser;

	const [categories, loading, error] = useCollectionData(
		query(
			collection(db, "users", user.uid, "categories"),
			orderBy("name", "asc")
		)
	);
	const usersCollectionRef = collection(db, "users", user.uid, "expenses");

	const [category, setCategory] = useState("");
	const [expense, setExpense] = useState("");
	const [amount, setAmount] = useState("");
	const [date, setDate] = useState(new Date());
	const [show, setShow] = useState(false);
	const [showCategory, setShowCategory] = useState(false);
	const [icon, setIcon] = useState("cash");
	const [id, setId] = useState("Cash");

	const createExpense = async () => {
		if (!(expense.trim().length > 0 && amount.trim().length > 0)) {
			showMessage({
				message: "Please fill all fields",
				type: "danger",
			});
			return;
		}

		if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0.0) {
			showMessage({
				message: "The amount must be a number greater than 0",
				type: "danger",
			});
			return;
		}

		if (!category) {
			showMessage({
				message: "Please fill all fields",
				type: "danger",
			});
			return;
		}

		await addDoc(usersCollectionRef, {
			name: expense,
			amount: parseFloat(amount),
			category: category,
			date: Timestamp.fromDate(date),
		}).then(async (docRef) => {
			await updateDoc(docRef, { id: docRef.id });
			showMessage({
				message: "Expense Added successfully!",
				type: "success",
			});
		});

		setCategory('');
		setExpense('');
		setAmount('');
		setDate(new Date());

		navigation.navigate('Dashboard');
	};

	const renderIcons = ({ item }) => (
		<TouchableOpacity style={styles.item} key={item.id} onPress={() => { setCategory(item.id); setIcon(item.icon); setId(item.name); setShowCategory(false); }}>
			<Ionicons name={item.icon} style={{ color: `#${((1 << 24) * Math.random() | 0).toString(16).padStart(6, '0')}` }} size={32} />
			<Text style={{ fontSize: 10 }}>{item.name}</Text>
		</TouchableOpacity>
	);

	return (
		<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={undefined}>
				<View style={styles.form}>
					<View style={styles.input}>
						<TextInput
							style={{ height: 50 }}
							placeholder="Expense name"
							onChangeText={setExpense}
							value={expense}
							maxLength={30}
						/>
					</View>
					<View style={styles.input}>
						<TextInput
							style={{ height: 50 }}
							placeholder="Amount"
							onChangeText={setAmount}
							value={amount}
							maxLength={5}
							keyboardType={"numeric"}
						/>
					</View>
					<TouchableOpacity onPress={() => setShow(true)}>
						<View style={styles.datePicker}>
							<Text style={{ color: '#a3a3a3' }}>{formatDate(date)}</Text>
							<Ionicons
								name="calendar-outline"
								size={20}
								color={'#a3a3a3'}
								style={styles.calendarIcon}
							/>
						</View>
					</TouchableOpacity>
					{show && (
						<DateTimePicker
							value={date}
							onChange={(e, date) => {
								if (date) setDate(date);
								setShow(false);
							}}
							maximumDate={new Date()}
						/>
					)}
					<View>
						<View style={{ justifyContent: "center" }}>
							<View style={styles.iconContainer}>
								<TouchableOpacity onPress={() => setShowCategory(!showCategory)}>
									<View style={styles.categoryContainer}>
										<Ionicons
											name={icon}
											size={30}
											color={'black'}
										/>
										<Text style={styles.categoryName}> {id}</Text>
									</View>
								</TouchableOpacity>
								{showCategory && (<FlatList
									data={[...categories].sort((a, b) => a.id > b.id)}
									renderItem={renderIcons}
									keyExtractor={(item) => item.key}
									numColumns={5}
									contentContainerStyle={styles.list}
									extraData={icon}
								/>)}
							</View>
						</View>
						<TouchableOpacity
							onPress={() => navigation.navigate("NewCategory")}>
							<Text style={styles.linkColor}>New Catetory</Text>
						</TouchableOpacity>
						<StatusBar style="auto" />
					</View>
					<TouchableOpacity
						onPress={() => createExpense()}>
						<View style={styles.button}>
							<Text style={styles.buttonText}>Add</Text>
						</View>
					</TouchableOpacity>
					<View>
						{loading && (
							<View style={styles.container}>
								<Text>Loading...</Text>
							</View>
						)}
						{error && (
							<View style={styles.container}>
								<Text>Error : {JSON.stringify(error)}</Text>
							</View>
						)}
					</View>
					<StatusBar style="auto" />
				</View>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
};

export default NewExpense;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
	},

	linkColor: {
		color: "#5DB075",
		marginBottom: 8,
		marginRight: 10,
		alignSelf: "flex-end",
	},

	form: {
		alignSelf: "stretch",
		marginTop: 32,
		marginLeft: 16,
		marginRight: 16,
	},

	input: {
		justifyContent: "center",
		backgroundColor: "#F6F6F6",
		height: 50,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#E8E8E8",
		borderRadius: 8,
	},

	datePicker: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#F6F6F6",
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#E8E8E8",
		borderRadius: 8,
	},

	button: {
		marginTop: 32,
		alignItems: "center",
		paddingTop: 16,
		paddingBottom: 16,
		borderRadius: 100,
		backgroundColor: "#74CA8D",
	},

	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	categoryContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: "center",
		justifyContent: 'center',
		paddingTop: 9,
		paddingBottom: 9,
		borderRadius: 6,
		marginBottom: 20,
		backgroundColor: "#eff3f5",
		borderWidth: 1,
		borderColor: '#e3e6e8',
	},
	categoryName: {
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: 16,
		fontWeight: "600",
	},
	iconContainer: {
		maxHeight: 400
	},
	item: {
		alignItems: 'center',
		justifyContent: 'center',
		width: '21%',
		paddingVertical: 12,
	},
});

const picker = StyleSheet.create({
	placeholder: {
		color: '#a3a3a3',
	},

	inputAndroidContainer: {
		backgroundColor: "#F6F6F6",
		borderWidth: 1,
		borderColor: "#E8E8E8",
		padding: 16,
		borderRadius: 8,
		marginBottom: 8,
		height: 50,
	},

	inputAndroid: {
		color: "black",
	},

	inputIOSContainer: {
		backgroundColor: "#F6F6F6",
		borderWidth: 1,
		borderColor: "#E8E8E8",
		padding: 16,
		borderRadius: 8,
		marginBottom: 8,
		height: 50,
	},
});
