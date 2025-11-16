import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updateEmail,
  updatePassword
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebaseConfig";

// Singleton pattern - Initialize Firebase app only once globally
let firebaseApp;
let firebaseAuth;
let firebaseDb;
let firebaseStorage;

const initializeFirebase = () => {
  if (!firebaseApp) {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  
  if (!firebaseAuth) {
    firebaseAuth = getAuth(firebaseApp);
  }
  
  if (!firebaseDb) {
    firebaseDb = getFirestore(firebaseApp);
  }
  
  if (!firebaseStorage) {
    firebaseStorage = getStorage(firebaseApp);
  }
  
  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage
  };
};

// Initialize immediately
const { app, auth, db, storage } = initializeFirebase();

// Create firebase namespace for backward compatibility
const firebase = {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updateEmail,
  updatePassword,
  getAuth: () => auth,
};

export { firebase, auth, db, storage };
