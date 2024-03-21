import 'react-native-gesture-handler';
import FlashMessage from "react-native-flash-message";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import Routes from "./src/routes/Routes";
import { firebase, auth } from "./firebase";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { loadCategories, loadExpenses } from "./src/redux/actions";
import { useDispatch } from 'react-redux';
import { useAuthState } from "react-firebase-hooks/auth";

const App = () => {
  // const auth = firebase.getAuth();
  const [currentUser] = useAuthState(auth);
  // const [currentUser] = useState(auth?.currentUser);
  const [initializing, setInitializing] = useState(true);
  const dispatch = useDispatch();

  const onAuthStateChangedHandler = (user) => {
    // setCurrentUser(user);
    if (initializing) {
      setInitializing(false);
    }
  };

  useEffect(() => {
    dispatch(loadExpenses());
    dispatch(loadCategories());
    const unsubscribe = auth.onAuthStateChanged(onAuthStateChangedHandler);
    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ActionSheetProvider>
      <>
        <Routes user={currentUser} />
        <FlashMessage position="top" />
      </>
    </ActionSheetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function AppWrapper() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}