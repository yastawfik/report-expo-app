import React, { useEffect, useState, useRef } from 'react';
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

type ReportDetailRouteProp = RouteProp<RootStackParamList, 'ReportDetail'>;

const downloadReportPdf = async (reportId: number) => {
  try {
    const downloadUrl = `http://192.168.103.37:8000/reports/${reportId}/download`;
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
  const [weights, setWeights] = useState<number[]>([]);
  const [average, setAverage] = useState(0);

  const downloadButtonRef = useRef(null);

  useEffect(() => {
    console.log("Raw report.weights:", report.weights);
    try {
      if (Array.isArray(report.weights)) {
        console.log("Weights already array:", report.weights);
        setWeights(report.weights);
      } else if (typeof report.weights === 'string') {
        const parsed = JSON.parse(report.weights);
        console.log("Parsed weights:", parsed);
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
  }, [report?.weights]);

  useEffect(() => {
    if (weights.length > 0) {
      const sum = weights.reduce((acc: number, val: number) => acc + val, 0);
      setAverage(Number((sum / weights.length).toFixed(2)));
    }
  }, [weights]);

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

        {weights.length > 0 ? (
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
        ) : (
          <Text style={{ textAlign: 'center', color: 'red' }}>
            Aucun poids à afficher pour ce rapport.
          </Text>
        )}

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

      {/* Use Pressable here with ref correctly forwarded */}
      <Pressable
        ref={downloadButtonRef}
        style={styles.closeButton}
        onPress={() => navigation.navigate('Home')}
      >
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
