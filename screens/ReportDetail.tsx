import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList, SubReport } from '../type';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Pressable, ScrollView } from 'react-native-gesture-handler';
import axios from 'axios';


type ReportDetailRouteProp = RouteProp<RootStackParamList, 'ReportDetail'>;

function ReportDetailScreen({ route }: { route: ReportDetailRouteProp }) {
  const { report } = route.params;
  // Use report here...
}
const HEADER_HEIGHT = 20;
const SUB_HEADER_HEIGHT = 0;
const TOP_OFFSET = HEADER_HEIGHT + SUB_HEADER_HEIGHT;

const downloadReportPdf = async (reportId: number) => {
  try {
    const downloadUrl = `http://192.168.105.108:8000/reports/${reportId}/download`;

    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `rapport_${reportId}.pdf`;
      link.target = '_blank';
      link.click();

      Alert.alert('Téléchargement', 'Le fichier PDF est en train de se télécharger.');
    } else {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileUri = FileSystem.documentDirectory + `rapport_${reportId}_${timestamp}.pdf`;
      const downloadResumable = FileSystem.createDownloadResumable(downloadUrl, fileUri);
      const downloadResult = await downloadResumable.downloadAsync();

      if (downloadResult?.uri) {
        Alert.alert('Téléchargement réussi', 'PDF enregistré et prêt à être partagé.');
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri);
        } else {
          Alert.alert('Partage non disponible', 'Impossible de partager ce fichier.');
        }
      } else {
        Alert.alert('Erreur', 'Le téléchargement a échoué.');
      }
    }
  } catch (error) {
    console.error('Download error:', error);
    Alert.alert('Erreur', 'Échec du téléchargement.');
  }
};

export default function ReportDetail() {
  const { params: { report: initialReport } } = useRoute<ReportDetailRouteProp>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [report, setReport] = useState<any>(initialReport);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullReport = async () => {
      try {
        const response = await axios.get(`http://192.168.105.108:8000/api/reports/${initialReport.id}`);
        setReport(response.data);
        console.log('API response data:', response.data);
      } catch (error) {
        console.error('Failed to fetch full report:', error);
        Alert.alert('Erreur', 'Impossible de charger le rapport complet.');
      } finally {
        setLoading(false);
      }
    };

    fetchFullReport();
  }, [initialReport.id]);
  useEffect(() => {
  console.log('Full Report:', report);
  console.log('Subreports:', report.subreports);
}, [report]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#A45B17" />
        <Text style={{ marginTop: 10 }}>Chargement du rapport...</Text>
      </View>
    );
  }

  return (
  <View style={{ flex: 1 }}>
     <ScrollView
        style={[styles.scrollView, { position: 'absolute', top: TOP_OFFSET, bottom: 0, left: 0, right: 0 }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator
      >
    <View style={styles.innerContent}>
      <Text style={styles.header}>Détails du Rapport</Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          📅 Date: <Text style={styles.value}>{report.created_at?.split('T')[0]}</Text>
        </Text>
        <Text style={styles.label}>
          ⏰ Heure: <Text style={styles.value}>{new Date(report.created_at).toLocaleTimeString()}</Text>
        </Text>
        <Text style={styles.label}>
          👤 Fait Par: <Text style={styles.value}>{report?.user?.name || 'Inconnu'}</Text>
        </Text>
        <Text style={styles.label}>
          👷‍♂️ Shift: <Text style={styles.value}>{report?.shift || 'Inconnu'}</Text>
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Liste des Poids des briques</Text>

      {Array.isArray(report.subreports) && report.subreports.length > 0 ? (
        report.subreports.map((sub:SubReport) => {
          let parsedWeights: number[] = [];

          try {
            if (Array.isArray(sub.weights)) {
              parsedWeights = sub.weights;
            } else if (typeof sub.weights === 'string') {
              const parsed = JSON.parse(sub.weights);
              if (Array.isArray(parsed)) parsedWeights = parsed.map(Number);
            }
          } catch (err) {
            console.warn('Error parsing weights for subreport', sub.id, err);
          }

          const average =
            parsedWeights.length > 0
              ? parsedWeights.reduce((a, b) => a + b, 0) / parsedWeights.length
              : 0;

          return (
            <View key={sub.id} style={styles.brickSection}>
              <Text style={styles.subsectionTitle}>
                🧪 {sub.zone || 'N/A'} - {sub.brick_type || 'N/A'}
              </Text>

              <Text style={styles.label}>
                🗓️ Date: <Text style={styles.value}>{sub.datetime?.split('T')[0] || 'N/A'}</Text>
              </Text>

         <FlatList
  data={parsedWeights}
  numColumns={2}
  keyExtractor={(_, index) => `${sub.id}-${index}`}
  columnWrapperStyle={styles.row}
  scrollEnabled={false} // important so the outer ScrollView handles scrolling
  renderItem={({ item, index }) => (
    <View style={styles.weightCard}>
      <Text style={styles.weightLabel}>#{index + 1}</Text>
      <Text style={styles.weightValue}>{item} kg</Text>
    </View>
  )}
/>

              <Text style={styles.averageText}>
                ⚖️ Poids Moyen: <Text style={styles.averageValue}>{average.toFixed(2)} kg</Text>
              </Text>
            </View>
          );
        })
      ) : (
        <Text style={{ marginVertical: 20, fontStyle: 'italic' }}>
          Aucun sous-rapport disponible.
        </Text>
      )}

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => downloadReportPdf(report.id)}
      >
        <Text style={styles.buttonText}>📄 Télécharger PDF</Text>
      </TouchableOpacity>

      <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Fermer</Text>
      </Pressable>
    </View>
    </ScrollView>
  
  </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
    contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A45B17',
    marginBottom: 10,
  },
    scrollView: {
    backgroundColor: '#f4f4f4',
  },
  scrollContainer: {
  padding: 16,
  paddingBottom: 80, // extra space for bottom buttons
  backgroundColor: '#FFF',
},
  card: {
    backgroundColor: '#F8EDE3',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  
innerContent: {
  flexGrow: 1, // allows scrolling even with little content
},
  value: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#A45B17',
  },
  subsectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
    color: '#8A4B08',
  },
  brickSection: {
    backgroundColor: '#FCEFEF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  weightCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    margin: 5,
    width: '47%',
    alignItems: 'center',
    borderColor: '#E0C3A0',
    borderWidth: 1,
  },
  weightLabel: {
    fontSize: 14,
    color: '#888',
  },
  weightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  averageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  averageValue: {
    fontWeight: 'bold',
    color: '#A45B17',
  },
  downloadButton: {
    backgroundColor: '#A45B17',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#CA0B00',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
