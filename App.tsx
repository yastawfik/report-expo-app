
import { StyleSheet, Text, View } from 'react-native';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './Auth';
import AppNavigation from './navigation/AppNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider> 
      <AuthProvider>
        <NavigationContainer>
          <AppNavigation />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>  
  );
}
