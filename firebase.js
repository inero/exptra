import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import * as firebase from "firebase/auth";
import { initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth/react-native";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD6CQ7RC6CPWnf75TTxkSwFH6QAOyaNNe4",
  authDomain: "fir-auth-aaa2e.firebaseapp.com",
  projectId: "fir-auth-aaa2e",
  storageBucket: "fir-auth-aaa2e.appspot.com",
  messagingSenderId: "904217172879",
  appId: "1:904217172879:web:b39b700ac2266d642d89fa",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);
const storage = getStorage(app);

export { firebase, auth, db, storage };
