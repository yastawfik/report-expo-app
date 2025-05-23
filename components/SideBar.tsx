import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  ListDePoids: undefined;  // <-- add here
};

const Sidebar: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.sidebar}>
      <Text style={styles.logo}>🧱 Usine</Text>

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.menuText}>🏠 Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ListDePoids')}>
        <Text style={styles.menuText}>📦 Poids de Brique</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Sidebar;

const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    backgroundColor: '#111827',
    padding: 20,
    height: '100%',
  },
  logo: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuText: {
    color: '#d1d5db',
    fontSize: 16,
  },
});
