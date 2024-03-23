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
import { firebase, db } from "../../firebase";
import { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { iconList } from "../utils/Icons";
import { addDoc, collection, orderBy, query, updateDoc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";


const NewCategory = ({ navigation }) => {
	const auth = firebase.getAuth();
	const user = auth.currentUser;
	const [show, setShow] = useState(false);

	const [categories, loading, error] = useCollectionData(
		query(
			collection(db, "users", user.uid, "categories"),
			orderBy("name", "asc")
		)
	);
	const usersCollectionRef = collection(db, "users", user.uid, "categories");

	const [name, setName] = useState("");
	const [icon, setIcon] = useState("");
	const [id, setId] = useState("");

	const createCategory = async (catName, catIcon) => {
		if (!(catName.trim().length > 0) || !(id.trim().length > 0)) {
			showMessage({
				message: "Please complete all fields",
				type: "danger",
			});
			return;
		}
		let cat = categories.findIndex(e => e.name === catName);
		if (cat === -1) {
			const docRef = await addDoc(usersCollectionRef, {
				name: catName,
				icon: catIcon,
			});
			await updateDoc(docRef, { id: docRef.id });

			setName("");
			setIcon("");
			setId('');

			navigation.goBack();
		} else {
			showMessage({
				message: "Category name already exist!",
				type: "danger",
			});
		}
	};

	const renderIcons = ({ item }) => (
		<TouchableOpacity style={styles.item} key={item.key} onPress={() => { setIcon(item.name); setId(item.id); setShow(false); }}>
			<Ionicons name={item.name} style={{ color: `#${((1 << 24) * Math.random() | 0).toString(16).padStart(6, '0')}` }} size={32} />
			<Text style={{ fontSize: 10 }}>{item.id}</Text>
		</TouchableOpacity>
	);

	return (
		<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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
						<TouchableOpacity onPress={() => setShow(!show)}>
							<View style={styles.categoryContainer}>
								<Ionicons
									name={icon}
									size={30}
									color={'black'}
								/>
								<Text style={styles.categoryName}> {id ? id : 'Select Category'}</Text>
							</View>
						</TouchableOpacity>
						{show && (<FlatList
							data={[...iconList].sort((a, b) => a.id > b.id)}
							renderItem={renderIcons}
							keyExtractor={(item) => item.key}
							numColumns={5}
							contentContainerStyle={styles.list}
							extraData={icon}
						/>)}
					</View>
					<TouchableOpacity
						onPress={() => createCategory(name, icon)}>
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
});
