  import React, { useState } from 'react';
  import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
  import axios from 'axios';

  export default function RegisterScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
      if (!name || !email || !password) {
        setError('All fields are required.');
        return;
      }

      try {
        setLoading(true);
        setError('');
        await axios.post('http://192.168.105.108:8000/api/register', {
          name,
          email,
          password,
        });
        Alert.alert('Success', 'Registration complete. Please login.');
        navigation.navigate('Login');
      } catch (e: any) {
        console.error('Registration error:', e.response?.data || e.message);
        setError('Registration failed. Try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>
        <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? <ActivityIndicator size="large" color="#007bff" /> : (
          <Button title="Register" onPress={handleRegister} color="#A45B17" />
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
      backgroundColor: '#fff'
    },
    error: { color: 'red', marginBottom: 10, textAlign: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }
  });
