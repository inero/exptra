import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	TouchableWithoutFeedback,
	Keyboard,
	KeyboardAvoidingView,
	FlatList,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { useState } from "react";
import { addCategory } from "../redux/actions";
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from "react-native-vector-icons/Ionicons";
import { iconList } from "../utils/Icons";

const NewCategory = ({ navigation }) => {
	const categories = useSelector((state) => state.categories);
	const dispatch = useDispatch();

	const [name, setName] = useState("");
	const [icon, setIcon] = useState("");

	const createCategory = (catName, catIcon) => {
		if (!(catName.trim().length > 0)) {
			showMessage({
				message: "Please complete all fields",
				type: "danger",
			});
			return;
		}
		let cat = categories.findIndex(e => e.name === catName);
		if (cat === -1) {
			dispatch(
				addCategory({
					id: categories.length ? categories.length + 1 : 1,
					name: catName,
					icon: catIcon ? catIcon : 'wallet'
				})
			);
			setName("");
			setIcon("");
			navigation.goBack();
		} else {
			showMessage({
				message: "Category name already exist!",
				type: "danger",
			});
		}
	};

	const renderIcons = ({ item }) => (
		<TouchableOpacity style={styles.item} key={item.key} onPress={() => setIcon(item.name)}>
			<Ionicons name={item.name} style={{ color: icon === item.name ? 'green' : '#bfbfbf' }} size={32} />
			<Text style={{ fontSize: 10 }}>{item.id}</Text>
		</TouchableOpacity>
	);

	return (
		<TouchableWithoutFeedback onPress={null}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={undefined}>
				<View style={styles.form}>
					<TextInput
						style={styles.input}
						placeholder="Category name"
						onChangeText={setName}
						value={name}
						maxLength={30}
					/>
					<View style={styles.iconContainer}>
						<FlatList
							data={[...iconList].sort((a, b) => a.id > b.id)}
							renderItem={renderIcons}
							keyExtractor={(item) => item.key}
							numColumns={5}
							contentContainerStyle={styles.list}
							extraData={icon}
						/>
					</View>
					<TouchableOpacity
						onPress={() => createCategory(name, icon)}>
						<View style={styles.button}>
							<Text style={styles.buttonText}>Add</Text>
						</View>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
};

export default NewCategory;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
		alignItems: "center",
	},

	iconContainer: {
		maxHeight: 400
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

	tinyLogo: {
		width: 30,
		height: 30,
	},

	form: {
		alignSelf: "stretch",
		marginTop: 32,
		marginLeft: 16,
		marginRight: 16,
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
	link_color: {
		color: "#5DB075",
		marginBottom: 10,
		marginLeft: 200,
	},
	list: {
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	item: {
		alignItems: 'center',
		justifyContent: 'center',
		width: '21%',
		paddingVertical: 12,
	},
});
