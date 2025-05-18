import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../Header';
import SubHeader from '../SubHeader';
import { useNavigation } from '@react-navigation/native';
import { Report } from '../type';

export default function AllReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const [userInitial, setUserInitial] = useState('A');

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://192.168.22.15:8000/api/reports');
      const data = (response.data as { data: Report[] }).data;
      const sorted = data.sort((a: Report, b: Report) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setReports(sorted);
    } catch (error) {
      console.error('❌ Error fetching all reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

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
      <Header userInitial={userInitial} onLogout={() => {}} />
      <SubHeader title="Historique Général" />

      {loading ? (
        <ActivityIndicator size="large" color="#A45B17" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun rapport disponible.</Text>
          }
        />
      )}
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
});
