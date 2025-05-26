import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert, Platform
} from 'react-native';
import Sidebar from '../components/SideBar';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../type';
import TableHeader from '../components/TableHeader';
import TableRow from '../components/TableRow';

const DashboardScreen = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchStart, setSearchStart] = useState('');
  const [searchEnd, setSearchEnd] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLockedOnly, setShowLockedOnly] = useState(true);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const baseUrl = 'http://192.168.105.108:8000/api';

  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cette page est uniquement disponible sur le web.</Text>
      </View>
    );
  }

  const fetchReports = async () => {
    setLoading(true);
    try {
      const startDate = convertToDateFormat(searchStart);
      const endDate = convertToDateFormat(searchEnd);

      let url = `${baseUrl}/reports?page=${page}`;
      if (startDate) url += `&start=${startDate}`;
      if (endDate) url += `&end=${endDate}`;
      if (showLockedOnly) {
        url += `&locked=1`;  // Show locked reports
      } else {
        url += `&locked=0`;  // Show unlocked reports
      }

      const response = await fetch(url);
      const json = await response.json();
      if (response.ok) {
        setReports(json.data);
        setTotalPages(json.last_page || 1);
      } else {
        Alert.alert("Erreur", json.message || "Erreur lors du chargement");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Erreur", "Impossible de charger les rapports");
    }
    setLoading(false);
  };

  const convertToDateFormat = (input: string) => {
    const [day, month, year] = input.split('/');
    if (!day || !month || !year) return '';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const startDate = convertToDateFormat(searchStart);
      const endDate = convertToDateFormat(searchEnd);

      let exportUrl = `${baseUrl}/reports/export-${type}`;
      const params = [];

      if (startDate) params.push(`start=${startDate}`);
      if (endDate) params.push(`end=${endDate}`);
      if (showLockedOnly) {
          params.push(`locked=1`);
        } else {
          params.push(`locked=0`);
        }

      if (params.length > 0) {
        exportUrl += '?' + params.join('&');
      }

      const response = await fetch(exportUrl);
      if (!response.ok) throw new Error("Le téléchargement a échoué.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Export error:", error);
      Alert.alert("Export échoué", error.message || "Une erreur est survenue.");
    }
  };

  const handleExportWebExcel = () => {
    const startDate = convertToDateFormat(searchStart);
    const endDate = convertToDateFormat(searchEnd);

    let url = `${baseUrl}/reports/export-excel`;
    const params = [];

    if (startDate) params.push(`start=${startDate}`);
    if (endDate) params.push(`end=${endDate}`);
      if (showLockedOnly) {
    params.push(`locked=1`);
  } else {
    params.push(`locked=0`);
  }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    window.open(url, '_blank');
  };

  const handleEyeClick = (report: any) => {
    if (report?.id) {
      navigation.navigate('ReportDetail', { report });
    } else {
      Alert.alert("Erreur", "ID de rapport introuvable.");
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, showLockedOnly]);

  return (
    <View style={styles.container}>
      <Sidebar />
      <View style={styles.content}>
        <View style={styles.filterRow}>
          <View style={styles.filterInputs}>
            <TextInput
              style={styles.input}
              placeholder="Début (jj/mm/aaaa)"
              value={searchStart}
              onChangeText={setSearchStart}
            />
            <TextInput
              style={styles.input}
              placeholder="Fin (jj/mm/aaaa)"
              value={searchEnd}
              onChangeText={setSearchEnd}
            />
            <TouchableOpacity style={styles.iconButton} onPress={fetchReports}>
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.rightButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => handleExport('pdf')}>
              <MaterialCommunityIcons name="file-pdf-box" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleExportWebExcel}>
              <MaterialCommunityIcons name="microsoft-excel" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { backgroundColor: showLockedOnly ? '#f59e0b' : '#3b82f6' },
              ]}
              onPress={() => {
                setShowLockedOnly(!showLockedOnly);
                setPage(1);
              }}
            >
              <Text style={styles.toggleText}>
                {showLockedOnly ? 'Non Validés' : 'Valider'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.table}>
          <TableHeader headers={['Date', 'Heure', 'Utilisateur', 'Action']} />
          {loading ? (
            <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
          ) : (
            reports.map((report, idx) => (
              <TableRow
                key={idx}
                report={{
                  date: report.created_at?.split('T')[0] || '—',
                  time: new Date(report.created_at).toLocaleTimeString() || '—',
                  username: report.user?.name || '—',
                }}
                onEyeClick={() => handleEyeClick(report)}
              />
            ))
          )}
        </ScrollView>

        <View style={styles.pagination}>
          <TouchableOpacity disabled={page === 1} onPress={() => setPage(page - 1)}>
            <Text style={styles.pageBtn}>◀</Text>
          </TouchableOpacity>
          {[...Array(totalPages)].map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setPage(i + 1)}>
              <Text style={[styles.pageNum, page === i + 1 && styles.activePage]}>
                {i + 1}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity disabled={page === totalPages} onPress={() => setPage(page + 1)}>
            <Text style={styles.pageBtn}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1, padding: 20 },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'nowrap',
    gap: 12,
  },
  filterInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,  // inputs + search take all available left space
  },
  input: {
    flex: 1,
    minWidth: 140,
    maxWidth: 180,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  iconButton: {
    backgroundColor: '#4b5563',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleText: {
    color: 'white',
    fontWeight: 'bold',
  },

  table: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: { flex: 1, fontWeight: 'bold' },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
    alignItems: 'center',
  },
  cell: { flex: 1 },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
    flexWrap: 'wrap',
  },
  pageBtn: { fontSize: 16, marginHorizontal: 10, color: '#2563eb' },
  pageNum: {
    marginHorizontal: 5,
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  activePage: {
    backgroundColor: '#2563eb',
    color: '#fff',
  },
});
