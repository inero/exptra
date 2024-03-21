import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import {
	Timestamp,
	collection,
	doc,
	orderBy,
	query,
	updateDoc,
} from "firebase/firestore";
import { firebase } from "../../firebase";

import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import RNPickerSelect from "react-native-picker-select";
import { StatusBar } from "expo-status-bar";
import { showMessage } from "react-native-flash-message";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useState } from "react";

const auth = firebase.getAuth();

const grayPlaceholder = Platform.OS === "ios" ? "#bebec0" : "#a3a3a3";

// function that takes a date and returns its string value in format dd/mm/yyyy
function formatDate(date) {
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();
	return `${day < 10 ? "0" + day : day}/${
		month < 10 ? "0" + month : month
	}/${year}`;
}

const EditExpense = ({ navigation, route }) => {
	const user = auth?.currentUser;

	const idExpense = route.params.expense;

	const [dp] = useDocumentData(
		doc(db, "users", user.uid, "expenses", idExpense)
	);

	const [category, setCategory] = useState("");
	const [expense, setExpense] = useState("");
	const [amount, setAmount] = useState("");

	const [date, setDate] = useState(new Date());
	const [show, setShow] = useState(false);

	const [categoryOnce, setCategoryOnce] = useState(false);
	const [expenseOnce, setExpenseOnce] = useState(false);
	const [amountOnce, setAmountOnce] = useState(false);
	const [dateOnce, setDateOnce] = useState(false);

	if (dp && !categoryOnce) {
		setCategory(dp.category);
		setCategoryOnce(true);
	}

	if (dp && !expenseOnce) {
		setExpense(dp.nom.toString());
		setExpenseOnce(true);
	}

	if (dp && !amountOnce) {
		setAmount(dp.amount.toString());
		setAmountOnce(true);
	}

	if (dp && !dateOnce) {
		setDate(dp.date.toDate());
		setDateOnce(true);
	}

	const modifierExpense = async () => {
		if (
			!(
				category.trim().length > 0 &&
				expense.trim().length > 0 &&
				amount.trim().length > 0
			)
		) {
			showMessage({
				message: "Please complete all fields",
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

		await updateDoc(doc(db, "users", user.uid, "expenses", idExpense), {
			nom: expense,
			amount: parseFloat(amount),
			category: category,
			date: Timestamp.fromDate(date),
		});

		navigation.goBack();
	};

	const [categories, loading, error] = [];
	// useCollectionData(
	// 	query(
	// 		collection(db, "users", user.uid, "categories"),
	// 		orderBy("nom", "asc")
	// 	)
	// );

	return (
		<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : undefined}>
				<View style={styles.form}>
					<View>
						<View style={{ justifyContent: "center" }}>
							{categories && categories.every((category) => category.id) && (
								<RNPickerSelect
									style={picker}
									useNativeAndroidPickerStyle={false}
									value={category}
									onValueChange={setCategory}
									placeholder={{
										label: "Nom de la catégorie",
										value: undefined,
									}}
									items={categories?.map((category) => ({
										key: category.id,
										label: category.nom,
										value: category.id,
									}))}
								/>
							)}
						</View>
						<TouchableOpacity
							onPress={() => navigation.navigate("NewCategory")}>
							<Text style={styles.linkColor}>New Category</Text>
						</TouchableOpacity>
						<StatusBar style="auto" />
					</View>

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
							<Text style={{ color: grayPlaceholder }}>{formatDate(date)}</Text>
							<Ionicons
								name="calendar-outline"
								size={20}
								color={grayPlaceholder}
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
						/>
					)}

					<TouchableOpacity
						onPress={() => {
							modifierExpense().then(() => {
								Keyboard.dismiss();
								setCategory("");
								setExpense("");
								setAmount("");
							});
						}}>
						<View style={styles.button}>
							<Text style={styles.buttonText}>Modifier</Text>
						</View>
					</TouchableOpacity>
					<StatusBar style="auto" />
				</View>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
};

export default EditExpense;

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
});

const picker = StyleSheet.create({
	placeholder: {
		color: grayPlaceholder,
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
