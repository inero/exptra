import 'react-native-gesture-handler';
import './suppressWarnings';
import FlashMessage from "react-native-flash-message";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import Routes from "./src/routes/Routes";
import { firebase, auth } from "./firebase";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { loadCategories, loadExpenses } from "./src/redux/actions";
import { useDispatch } from 'react-redux';
import { useAuthState } from "react-firebase-hooks/auth";
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const App = () => {
  const [currentUser] = useAuthState(auth);
  const [initializing, setInitializing] = useState(true);
  const dispatch = useDispatch();
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.5))[0];

  const onAuthStateChangedHandler = (user) => {
    if (initializing) {
      setInitializing(false);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    dispatch(loadExpenses());
    dispatch(loadCategories());
    const unsubscribe = auth.onAuthStateChanged(onAuthStateChangedHandler);
    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.loaderContainer}>
        <Animated.View 
          style={[
            styles.loaderContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          <View style={styles.iconWrapper}>
            <Ionicons name="wallet" size={80} color="#fff" />
          </View>
          <Text style={styles.loaderTitle}>Exptra</Text>
          <Text style={styles.loaderSubtitle}>Track Your Expenses</Text>
          <ActivityIndicator 
            size="large" 
            color="#fff" 
            style={styles.spinner} 
          />
        </Animated.View>
      </LinearGradient>
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
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderContent: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loaderTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  loaderSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 40,
  },
  spinner: {
    marginTop: 20,
  },
});

export default function AppWrapper() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}