import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../type';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Pressable } from 'react-native-gesture-handler';
import { useEffect } from 'react';

type ReportDetailRouteProp = RouteProp<RootStackParamList, 'ReportDetail'>;

const downloadReportPdf = async (reportId: number) => {
  try {
    const downloadUrl = `http://192.168.103.50:8000/reports/${reportId}/download`;

    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `rapport_${reportId}.pdf`;
      link.target = '_blank';
      link.click();

      Alert.alert('Téléchargement', 'Le fichier PDF est en train de se télécharger.');
    } else {
      const fileUri = FileSystem.documentDirectory + `rapport_${reportId}.pdf`;
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
  const { params: { report } } = useRoute<ReportDetailRouteProp>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  useEffect(() => {
  console.log('Report Data:', report); // Log report data
}, [report])

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
        <Text style={styles.label}>
          👷‍♂️ Shift: <Text style={styles.value}>{report?.shift || 'Inconnu'}</Text>
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Liste des Poids des briques</Text>

      {Array.isArray(report.subreports) && report.subreports.length > 0 ? (
        report.subreports.map((sub, subIndex) => {
          let parsedWeights: number[] = [];

          try {
            if (Array.isArray(sub.weights)) {
              parsedWeights = sub.weights;
            } else if (typeof sub.weights === 'string') {
              const parsed = JSON.parse(sub.weights);
              if (Array.isArray(parsed)) parsedWeights = parsed.map(Number);
            }
          } catch (err) {
            console.warn('Error parsing weights for subreport', subIndex, err);
          }

          const average =
            parsedWeights.length > 0
              ? parsedWeights.reduce((a, b) => a + b, 0) / parsedWeights.length
              : 0;

          return (
            <View key={subIndex} style={styles.brickSection}>
              <Text style={styles.subsectionTitle}>
                🧪 {sub.zone} - {sub.brick_type}
              </Text>

              <FlatList
                data={parsedWeights}
                numColumns={2}
                columnWrapperStyle={styles.row}
                keyExtractor={(_, index) => `sub-${subIndex}-${index}`}
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
