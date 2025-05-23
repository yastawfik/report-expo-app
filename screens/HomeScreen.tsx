import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
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

  // For custom delete confirmation modal
  const [modalVisible, setModalVisible] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  // Define the combined height of Header and SubHeader
const HEADER_HEIGHT = 60;
const SUB_HEADER_HEIGHT = 46; // Adjust if your SubHeader's actual height is different
const TOP_OFFSET = HEADER_HEIGHT + SUB_HEADER_HEIGHT;
const FIRST_ITEM_MARGIN_TOP = 16; // Adjust this value to control the space

  const fetchReportsAndUser = async () => {
    try {
      setLoading(true);
      const [reportResponse, userData] = await Promise.all([
        axios.get('http://192.168.105.108:8000/api/reports'),
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

  // Show modal to confirm delete
  const confirmDeleteReport = (id: number) => {
    setReportToDelete(id);
    setModalVisible(true);
  };

  // Actually delete report
  const handleDeleteConfirmed = async () => {
    if (reportToDelete === null) return;

    try {
      const response = await axios.delete(`http://192.168.105.108:8000/api/reports/${reportToDelete}`);
      console.log('✅ Report deleted from backend:', response.data);
      setReports((prev) => prev.filter((r) => r.id !== reportToDelete));
    } catch (error: any) {
      console.error('❌ Delete error:', error?.response || error.message || error);
      // Optional: add some feedback for user here
    } finally {
      setModalVisible(false);
      setReportToDelete(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReportsAndUser();

      if (route.params?.newReport) {
        navigation.setParams({ newReport: null });
      }
    }, [route.params?.newReport])
  );

 const renderItem = ({ item, index }: { item: Report; index: number }) => {
    const date = new Date(item.created_at);
    const isFirstItem = index === 0;
   const cardStyle = isFirstItem
      ? [{ ...styles.card, marginTop: FIRST_ITEM_MARGIN_TOP }]
      : [styles.card];
      
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

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ReportDetail', { report: item })}
          >
            <MaterialIcons name="info" size={16} color="#fff" />
            <Text style={styles.buttonText}> Voir Détails</Text>
          </TouchableOpacity>

        {!item.locked && (
  <TouchableOpacity
    style={[styles.button, styles.editButton]}
    onPress={() => navigation.navigate('EditReport', { report: item })}
  >
    <MaterialIcons name="edit" size={16} color="#fff" />
    <Text style={styles.buttonText}> Modifier</Text>
  </TouchableOpacity>
)}

 {!item.locked && (
  <TouchableOpacity
    style={[styles.button, styles.deleteButton]}
    onPress={() => confirmDeleteReport(item.id)}
  >
    <MaterialIcons name="delete" size={16} color="#fff" />
    <Text style={styles.buttonText}> Supprimer</Text>
  </TouchableOpacity>
)}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header userInitial={userInitial} onLogout={handleLogout} />
      <SubHeader title="Historique Personnel" />
      {loading ? (
        <ActivityIndicator size="large" color="#A45B17" style={{ marginTop: 50 }} />
      ) : (
    <FlatList
  data={reports}
  renderItem={renderItem}
  keyExtractor={(item) => item.id.toString()}
  contentContainerStyle={styles.list}
  ListEmptyComponent={<Text style={styles.emptyText}>Aucun rapport trouvé.</Text>}
  style={[styles.flatList, { position: 'absolute', top: TOP_OFFSET, bottom: 0, left: 0, right: 0 }]}
   showsVerticalScrollIndicator={true}
 scrollEnabled={true}
/>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AjouterReport')}
      >
        <MaterialIcons name="add-circle" size={56} color="#A45B17" />
      </TouchableOpacity>

      {/* Custom confirmation modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmer la suppression</Text>
            <Text style={styles.modalMessage}>Êtes-vous sûr de vouloir supprimer ce rapport ?</Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.deleteConfirmButton]}
                onPress={handleDeleteConfirmed}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Supprimer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    marginTop: 0, // Added to allow dynamic marginTop override
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
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  editButton: {
    backgroundColor: '#f0a500',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    marginLeft: 8,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
    flatList: {
    backgroundColor: '#f4f4f4',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  deleteConfirmButton: {
    backgroundColor: '#d9534f',     
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
