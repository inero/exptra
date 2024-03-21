import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/auth';

const EmailValidation = () => {
  const currentUser = firebase.auth().currentUser;

  const handleSendVerificationEmail = () => {
    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    currentUser.sendEmailVerification()
      .then(() => {
        Alert.alert('Verification Email Sent', 'Please check your email inbox to verify your email address.');
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Validation</Text>
      {currentUser && !currentUser.emailVerified && (
        <View>
          <Text style={styles.infoText}>Your email address has not been verified.</Text>
          <Button title="Send Verification Email" onPress={handleSendVerificationEmail} />
        </View>
      )}
      {currentUser && currentUser.emailVerified && (
        <Text style={styles.infoText}>Your email address has been verified.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default EmailValidation;