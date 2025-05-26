import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Sidebar from '../components/SideBar';
import { useAuth } from '../Auth'; // adjust path accordingly

const DashboardHome = () => {
  const { user } = useAuth();

  // user?.name or user?.username depending on your user object structure
  const username = user?.name || 'Invité';

  return (
    <View style={styles.container}>
      <Sidebar />
      <View style={styles.content}>
        <View style={styles.centeredBox}>
          <Text style={styles.welcomeText}>Bienvenue à votre Dashboard, {username}</Text>
        </View>
      </View>
    </View>
  );
};

export default DashboardHome;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centeredBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
});
