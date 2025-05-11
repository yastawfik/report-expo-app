import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { Report } from '../type';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../Header';
import SubHeader from '../SubHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../Auth';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setIsLoggedIn } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [userInitial, setUserInitial] = useState('U');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  const fetchReportsAndUser = async () => {
    try {
      setLoading(true);
      const [reportResponse, userData] = await Promise.all([ 
        axios.get('http://192.168.1.216:8000/api/reports'),
        AsyncStorage.getItem('user'),
      ]);

      if (!userData) {
        setReports([]);
        return;
      }

      const user = JSON.parse(userData);
      setCurrentUser(user);
      setUserInitial((user.name || user.email || '').charAt(0).toUpperCase());

      const data = reportResponse.data as { data: Report[] };
      const allReports: Report[] = Array.isArray(data.data) ? data.data : [];
      const userReports = allReports
      .filter((report) => report.user_id === user.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setReports(userReports);
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to fetch reports each time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchReportsAndUser();
      
      // Clear newReport param after fetching
      if (route.params?.newReport) {
        navigation.setParams({ newReport: null });
      }
    }, [route.params?.newReport])
  );

  const renderItem = ({ item }: { item: Report }) => {
    const date = new Date(item.created_at);
    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.user?.name || 'Nom Inconnu'}</Text>

        <View style={styles.row}>
          <MaterialIcons name="calendar-today" size={20} color="#A45B17" />
          <Text style={styles.text}>{date.toLocaleDateString()}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="access-time" size={20} color="#A45B17" />
          <Text style={styles.text}>
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ReportDetail', { report: item })}
        >
          <MaterialIcons name="info" size={16} color="#fff" />
          <Text style={styles.buttonText}> Voir Détails</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header userInitial={userInitial} onLogout={handleLogout} />
      <SubHeader onFilterPress={() => console.log('Filter pressed')} />
      {loading ? (
        <ActivityIndicator size="large" color="#A45B17" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun rapport trouvé.</Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AjouterReport')}
      >
        <MaterialIcons name="add-circle" size={56} color="#A45B17" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    backgroundColor: '#f4f4f4',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 5,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#A45B17',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#777',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
});
