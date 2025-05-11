import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ReportDetail from '../screens/ReportDetail';
import ReportForm from '../screens/ReportForm';
import { useAuth } from '../Auth';
import RegisterScreen from '../screens/RegisterScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, StatusBar} from 'react-native';
import AjouterReport from '../screens/AjouterReport';


const Stack = createStackNavigator();

export default function AppNavigation() {
  const { isLoggedIn } = useAuth();

  return (
  
<Stack.Navigator screenOptions={{ headerShown: false }}>
  {!isLoggedIn ? (
    <>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </>
  ) : (
    <>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AjouterReport" component={AjouterReport} />
      <Stack.Screen name="ReportDetail" component={ReportDetail} />
      <Stack.Screen name="ReportForm" component={ReportForm} />
    </>
  )}
</Stack.Navigator>
 
   
  );
}
