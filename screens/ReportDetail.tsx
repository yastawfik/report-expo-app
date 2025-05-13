import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../type';
import { Pressable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';


type ReportDetailRouteProp = RouteProp<RootStackParamList, 'ReportDetail'>;

const downloadReportPdf = async (reportId: number) => {
  try {
    const downloadUrl = `http://192.168.103.37:8000/reports/${reportId}/download`;

    if (Platform.OS === 'web') {
      // For web, open the PDF in a new tab or trigger a download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `rapport_${reportId}.pdf`;
      link.target = '_blank';
      link.click();

      Alert.alert('Téléchargement', 'Le fichier PDF est en train de se télécharger.');
    } else if (Platform.OS === 'android' || Platform.OS === 'ios') {
      // For mobile (Android/iOS), use expo-file-system
      const fileUri = FileSystem.documentDirectory + `rapport_${reportId}.pdf`;

      console.log('Attempting to download:', downloadUrl);

      const downloadResumable = FileSystem.createDownloadResumable(downloadUrl, fileUri);
      const downloadResult = await downloadResumable.downloadAsync();

      if (downloadResult?.uri) {
        console.log('PDF downloaded to:', downloadResult.uri);
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
  const {
    params: { report },
  } = useRoute<ReportDetailRouteProp>();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Parse weights safely
 const [weights, setWeights] = useState<number[]>([]);
const [average, setAverage] = useState(0);

useEffect(() => {
  try {
    if (Array.isArray(report.weights)) {
      setWeights(report.weights);
    } else if (typeof report.weights === 'string') {
      const parsed = JSON.parse(report.weights);
      if (Array.isArray(parsed)) {
        setWeights(parsed);
      } else {
        console.warn("Parsed weights is not array.");
        setWeights([]);
      }
    } else {
      console.warn("Unknown format of weights");
      setWeights([]);
    }
  } catch (error) {
    console.error("Error parsing weights:", error);
    setWeights([]);
  }
}, [report.weights]);

useEffect(() => {
  if (weights.length > 0) {
    const numericWeights = weights.map(Number); // ← key fix
    const sum = numericWeights.reduce((acc, val) => acc + val, 0);
    const avg = sum / numericWeights.length;
    setAverage(Number(avg.toFixed(2)));
  } else {
    setAverage(0);
  }
}, [weights]);
useEffect(() => {
  console.log('report.weights:', report.weights);
  console.log('Type of report.weights:', typeof report.weights);
}, []);
  

  return (
    <View style={styles.container}>
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
      </View>

      <Text style={styles.sectionTitle}>Liste des Poids des briques</Text>

      <View style={styles.brickSection}>
        <Text style={styles.subsectionTitle}>🧪  {report.zone} - {report.brick_type}</Text>

        <FlatList
          data={weights}
          numColumns={2}
          columnWrapperStyle={styles.row}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.weightCard}>
              <Text style={styles.weightLabel}>#{index + 1}</Text>
              <Text style={styles.weightValue}>{item} kg</Text>
            </View>
          )}
        />

        <Text style={styles.averageText}>
          ⚖️ Poids Moyen: <Text style={styles.averageValue}>{average} kg</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => downloadReportPdf(report.id)}
      >
        <Text style={styles.buttonText}>📄 Télécharger PDF</Text>
      </TouchableOpacity>

      <Pressable style={styles.closeButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Fermer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A45B17',
    marginBottom: 10,
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
    backgroundColor: '#7a0012',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
