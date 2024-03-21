import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { firebase } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";

import { showMessage } from "react-native-flash-message";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useState } from "react";

const auth = firebase.getAuth();

const EditCategory = ({ navigation, route }) => {
	const user = auth?.currentUser;

	const idCategory = route.params.category;

	const [category] = [];
	// useDocumentData(
	// 	doc(db, "users", user.uid, "categories", idCategory)
	// );

	const [name, setName] = useState("");
	const [limit, setLimit] = useState("");

	const [nameOnce, setNameOnce] = useState(false);
	const [limitOnce, setLimitOnce] = useState(false);

	if (category && !nameOnce) {
		setName(category.name);
		setNameOnce(true);
	}

	if (category && !limitOnce) {
		setLimit(category.limit.toString());
		setLimitOnce(true);
	}

	const modifierCategory = async () => {
		if (!(name.trim().length > 0 && limit.trim().length > 0)) {
			showMessage({
				message: "Please complete all fields",
				type: "danger",
			});
			return;
		}

		if (isNaN(parseFloat(limit)) || parseFloat(limit) <= 0.0) {
			showMessage({
				message: "Limit must be a number greater than 0",
				type: "danger",
			});
			return;
		}

		await updateDoc(doc(db, "users", user.uid, "categories", idCategory), {
			name: name,
			limit: parseFloat(limit),
		});

		navigation.goBack();
	};

	return (
		<View style={styles.container}>
			{category && (
				<View style={styles.form}>
					<TextInput
						style={styles.input}
						placeholder="Category name"
						value={name}
						onChangeText={setName}
						maxLength={30}
					/>

					<TextInput
						style={styles.input}
						placeholder="Limit"
						value={limit}
						onChangeText={setLimit}
						keyboardType={"numeric"}
						maxLength={6}
					/>

					<TouchableOpacity
						onPress={async () => {
							await modifierCategory(name, limit);
						}}>
						<View style={styles.button}>
							<Text style={styles.buttonText}>Edit</Text>
						</View>
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
};

export default EditCategory;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
		alignItems: "center",
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
});
