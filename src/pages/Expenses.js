import {
	Dimensions,
	StyleSheet,
	Text,
	TouchableHighlight,
	TouchableOpacity,
	View,
} from "react-native";
import { firebase } from "../../firebase";
import Ionicons from "react-native-vector-icons/Ionicons";
import GaugeExpenses from "../components/GaugeExpenses";
import { LineChart } from "react-native-chart-kit";
import { StatusBar } from "expo-status-bar";
import { SwipeListView } from "react-native-swipe-list-view";
import { useSelector } from 'react-redux';
import { useState } from "react";
import { months } from '../utils/Months';

const auth = firebase.getAuth();

const parseDateString = (dateString) => {
	const parts = dateString.split('/');
	return new Date(parts[2], parts[1] - 1, parts[0]);
};

const Expenses = ({ navigation }) => {
	const categories = useSelector((state) => state.categories);
	const expenses = useSelector((state) => state.expenses);
	const [budget, setBudget] = useState(auth?.currentUser?.photoURL);
	const [reportMonth, setReportMonth] = useState(parseInt(new Date().getMonth() + 1));
	const revMonth = [5, 4, 3, 2, 1, 0]
	const expensesTotal = () => {
		return expenses.filter((exp) => {
			const dte = parseDateString(exp.date).getMonth() + 1;
			if (dte === reportMonth) return exp;
		}).reduce((total, exp) => parseInt(total) + parseInt(exp.amount), 0);
	};

	const exp = expenses ? expensesTotal() : 0;
	const max = budget;
	const percentage = expenses && expenses.length > 0
		? Math.round((expensesTotal() / budget) * 100)
		: 0;

	const calculateLastSixMonths = () => {
		const six = [];
		const d = new Date();

		for (let i = 0; i <= 5; i++) {
			const tmp = d.getMonth() - i;
			if (tmp < 0) {
				six.push(tmp + 12);
			} else {
				six.push(tmp);
			}
		}
		return six.reverse();
	};

	const lastSixMonths = calculateLastSixMonths();
	const lastSixMonthsLabels = lastSixMonths.map((noMonth) => months[noMonth]);

	const sumLastSixMonths = lastSixMonths.map((noMonth) => {
		if (expenses) {
			return expenses
				.filter((expense) => parseDateString(expense.date).getMonth() === noMonth)
				.reduce((total, expense) => parseInt(total) + parseInt(expense.amount), 0);
		} else {
			return 0;
		}
	});

	const data = {
		labels: lastSixMonthsLabels,
		datasets: [
			{
				data: sumLastSixMonths,
				color: (opacity = 1) => `rgba(75, 161, 68, ${opacity})`,
				strokeWidth: 2,
			},
		],
	};

	const chartConfig = {
		backgroundGradientFrom: "#fff",
		backgroundGradientFromOpacity: 0,
		backgroundGradientTo: "#fff",
		backgroundGradientToOpacity: 0.5,
		color: (opacity = 1) => `rgba(75, 161, 68, ${opacity})`,
		strokeWidth: 2,
		barPercentage: 0.5,
		useShadowColorFromDataset: false,
		propsForDots: {
			r: "7",
			strokeWidth: "7",
			stroke: "#0dff00",
		},
	};

	const renderCategory = ({ item }) => {
		const sumExpenseCategory = expenses
			? expenses
				.filter((expense) => (expense.category === item.id && parseDateString(expense.date).getMonth() === reportMonth - 1))
				.reduce((total, expense) => total + expense.amount, 0)
			: 0;
		const rate = budget * sumExpenseCategory / 100;
		if (sumExpenseCategory === 0) {
			return <></>;
		}
		return (
			<TouchableHighlight
				key={item.id}
				style={styles.category}
				underlayColor="#f5f5f5"
				onPress={() => {
					navigation.navigate("ExpenseCategories", {
						categoryId: item.id,
						categoryName: item.name,
						monthId: reportMonth - 1,
					});
				}}>
				<>
					<Text style={{ fontSize: 16, paddingLeft: 10 }}>{item.name}</Text>
					<View style={{ flexDirection: "row", fontSize: 16, paddingRight: 10 }}>
						{rate < 0.7 && (<Text style={{ color: "green" }}>{sumExpenseCategory} ₹</Text>)}
						{rate >= 0.7 && rate < 0.9 && (<Text style={{ color: "#e67e00" }}>{sumExpenseCategory} ₹</Text>)}
						{rate >= 0.9 && rate < 1 && (<Text style={{ color: "red" }}>{sumExpenseCategory} ₹</Text>)}
						{rate >= 1.0 && (<Text style={{ color: "#8c1818" }}>{sumExpenseCategory} ₹</Text>)}
					</View>
				</>
			</TouchableHighlight>
		);
	};

	const renderSwipeButtons = (data, map) => (
		<View style={styles.swipeButtons}>
			<TouchableOpacity
				style={[styles.backButton, styles.backButtonRL]}
				onPress={() => map[data.item.id].closeRow()}>
				<Text style={{ color: "white" }}>Close</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.backButton, styles.backButtonRR]}
				onPress={() => deleteCategy(data.item.id)}>
				<Ionicons name="trash-outline" color={"#FFF"} size={28} />
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.backButton, styles.backButtonL]}
				onPress={() => {
					navigation.navigate("EditCategory", {
						categorie: data.item.id,
						title: data.item.name,
					});
					map[data.item.id].closeRow();
				}}>
				<Ionicons name="create-outline" color={"#FFF"} size={28} />
			</TouchableOpacity>
		</View>
	);

	const deleteCategy = () => {
		alert('Testing');
	};

	return (
		<View style={styles.container}>
			<View
				style={[
					styles.semi,
					styles.container,
					{ backgroundColor: "#2a3e48" },
				]}>
				<GaugeExpenses exp={exp} max={max} percentage={percentage} month={reportMonth} />
			</View>

			<View style={styles.slide2}>
				<LineChart
					data={data}
					width={Dimensions.get("window").width}
					height={230}
					verticalLabelRotation={0}
					chartConfig={chartConfig}
					onDataPointClick={(data) => {
						const curMonth = parseInt(new Date().getMonth() + 1);
						const monthIndex = revMonth[data.index];
						let calcMonth;
						if (monthIndex >= curMonth) {
							const diff = monthIndex - curMonth;
							calcMonth = 12 - diff;
						} else {
							calcMonth = curMonth - revMonth[data.index];
						}
						setReportMonth(calcMonth);
					}}
					getDotColor={(data, dataPointIndex) => {
						if (dataPointIndex === 5) return '#107010';
						return '#838889';
					}}
					bezier
				/>
			</View>

			<View style={styles.semi}>
				{categories && categories.length === 0 && (
					<View style={{ marginTop: 20 }}>
						<Text style={{ alignSelf: "center" }}>
							You have no category. Please added one 😉
						</Text>
					</View>
				)}

				{categories && categories.length > 0 && (
					<SwipeListView
						style={styles.swipeListView}
						useFlatList={true}
						data={categories}
						renderItem={renderCategory}
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

	semi: { flex: 1, alignSelf: "stretch" },

	slide2: {
		flex: 1,
		justifyContent: "center",
		backgroundColor: "#fff",
	},

	dot: {
		backgroundColor: "rgba(60,60,60,.3)",
		width: 10,
		height: 10,
		borderRadius: 7,
		marginLeft: 7,
		marginTop: 20,
	},

	activeDot: {
		backgroundColor: "#000",
		width: 10,
		height: 10,
		borderRadius: 7,
		marginLeft: 7,
		marginTop: 7,
		marginTop: 20,
	},

	category: {
		flexDirection: "row",
		minWidth: "60%",
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
		backgroundColor: "grey",
	},

	backButtonRL: {
		backgroundColor: "grey",
		right: 75,
	},

	backButtonRR: {
		backgroundColor: "#515050",
		right: 0,
	},

	swipeListView: {
		paddingTop: 15,
	}
});

export default Expenses;
