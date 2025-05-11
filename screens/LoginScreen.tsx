import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../Auth';
import axios from 'axios';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
  
    try {
      setLoading(true);
      const response = await axios.post<{ token: string; user: any }>('http://192.168.0.172:8000/api/login', {
        email,
        password,
      });
  
      console.log('API Response:', response.data); // Ensure token and user are here
  
      const token = response.data.token;
      const user = response.data.user;
  
      if (!token || !user) {
        console.warn('⚠️ Token or user missing from response.');
        Alert.alert('Login Failed', 'Token or user missing in response.');
        return;
      }
  
      // Use login from context, which will handle storage if keepLoggedIn is true
      login(token, user, keepLoggedIn);
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      Alert.alert('Login Failed', 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };
  
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity onPress={() => setKeepLoggedIn(!keepLoggedIn)} style={styles.keepLoggedIn}>
        <Text>{keepLoggedIn ? '☑' : '☐'} Keep me logged in</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#A45B17" />
      ) : (
        <>
          <Button title="Login" onPress={handleLogin} color="#A45B17" />
          <View style={styles.spacer} />
          <Button title="Register" onPress={() => navigation.navigate('Register')} color="#6c757d" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  spacer: { height: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  keepLoggedIn: { marginBottom: 16 },
});
