import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

interface Report {
  id: number;
  zone: string;
  brick_type: string;
  average_weight: number;
  created_at: string;
  user: {
    name: string;
  };
}

export default function AllReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get<Report[]>('http://192.168.103.41:8000/api/reports/all');
        setReports(response.data);
      } catch (error) {
        Alert.alert('Erreur', 'Échec du chargement des rapports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 Tous les Rapports</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <Text style={styles.reportText}>🧱 {item.brick_type}</Text>
            <Text style={styles.reportText}>📍 {item.zone}</Text>
            <Text style={styles.reportText}>⚖️ {item.average_weight} kg</Text>
            <Text style={styles.reportText}>👤 {item.user?.name || 'Inconnu'}</Text>
            <Text style={styles.reportText}>📅 {item.created_at.split('T')[0]}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#A45B17',
  },
  reportCard: {
    backgroundColor: '#F8EDE3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  reportText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
});
