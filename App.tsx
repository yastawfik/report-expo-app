
import { StyleSheet, Text, View } from 'react-native';

import React from 'react';
import AppNavigation from './navigation/AppNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './Auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
 
    <AuthProvider>
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <AppNavigation />
      </View>
    </NavigationContainer>
    </AuthProvider>

  
  );
}



const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
