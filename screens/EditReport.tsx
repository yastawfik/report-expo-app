import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { RootStackParamList } from '../type';
import { Report } from '../type';
import { SubReport } from '../type';

type EditScreenRouteProp = RouteProp<RootStackParamList, 'EditReport'>;
type EditScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditReport'>;

export default function EditScreen() {
  const route = useRoute<EditScreenRouteProp>();
  const navigation = useNavigation<EditScreenNavigationProp>();
  const { report } = route.params;

  const [subReports, setSubReports] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullReport, setFullReport] = useState<any | null>(null);

  const zones = ['Séchoir', 'Zone 2', 'Zone 3'];
  const brickTypes = ['B8-25', 'B10', 'B12'];

  useEffect(() => {
    const fetchFullReport = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Report>(`http://192.168.103.47:8000/api/reports/${report.id}`);
        const fetchedReport = response.data;

        setFullReport(fetchedReport);

        if (fetchedReport.subreports) {
          const parsed = fetchedReport.subreports.map((sub: any) => {
            let weights = [];
            try {
              weights = typeof sub.weights === 'string' ? JSON.parse(sub.weights) : sub.weights;
            } catch {
              weights = [];
            }
            return {
              id: sub.id,
              zone: sub.zone || '',
              brick_type: sub.brick_type || '',
              weights: weights.map((w: number) => w.toString()),
              average_weight: parseFloat(sub.average_weight) || 0,
            };
          });
          setSubReports(parsed);
        } else {
          setSubReports([]);
        }
      } catch (error) {
        console.error('Failed to fetch full report:', error);
        Alert.alert('Erreur', 'Impossible de charger le rapport complet.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchFullReport();
  }, [report.id, navigation]);

  const calculateAverage = (weights: string[]) => {
    const numeric = weights.map(w => parseFloat(w)).filter(w => !isNaN(w));
    if (numeric.length === 0) return 0;
    const avg = numeric.reduce((acc, cur) => acc + cur, 0) / numeric.length;
    return Number(avg.toFixed(2));
  };

  const handleWeightChange = (subIndex: number, weightIndex: number, value: string) => {
    const updated = [...subReports];
    updated[subIndex].weights[weightIndex] = value;
    updated[subIndex].average_weight = calculateAverage(updated[subIndex].weights);
    setSubReports(updated);
  };

  const handleBrickTypeChange = (subIndex: number, value: string) => {
    const fieldCount = value === 'B8-25' ? 8 : value === 'B10' ? 4 : value === 'B12' ? 6 : 0;
    const updated = [...subReports];
    updated[subIndex].brick_type = value;
    updated[subIndex].weights = Array(fieldCount).fill('');
    updated[subIndex].average_weight = 0;
    setSubReports(updated);
  };

  const handleZoneChange = (subIndex: number, value: string) => {
    const updated = [...subReports];
    updated[subIndex].zone = value;
    setSubReports(updated);
  };

  const handleUpdate = async () => {
    for (let sub of subReports) {
      if (!sub.zone) {
        Alert.alert('Erreur', 'Veuillez sélectionner la zone pour tous les sous-rapports.');
        return;
      }
      if (!sub.brick_type) {
        Alert.alert('Erreur', 'Veuillez sélectionner le type de brique pour tous les sous-rapports.');
        return;
      }
    }

    setSaving(true);
    try {
      for (let sub of subReports) {
        await axios.put(`http://192.168.103.47:8000/api/subreports/${sub.id}`, {
          zone: sub.zone,
          brick_type: sub.brick_type,
          weights: sub.weights.map((w: string) => parseFloat(w)),
          average_weight: sub.average_weight,
        });
      }
      Alert.alert('Succès', 'Rapport mis à jour.');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "La mise à jour a échoué.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#A45B17" />
      </View>
    );
  }

  if (!fullReport) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <Text>Rapport non trouvé</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Modifier le Rapport</Text>

        <Text style={styles.label}>📅 Date: {fullReport.created_at.split('T')[0]}</Text>
        <Text style={styles.label}>👤 Fait Par: {fullReport?.user?.name || 'Inconnu'}</Text>

        {subReports.map((sub, index) => (
          <View key={sub.id || index} style={styles.subCard}>
            <Text style={styles.subTitle}>🧱 Zone {index + 1}</Text>

            <Text style={styles.inputLabel}>Zone</Text>
            <Picker
              selectedValue={sub.zone}
              onValueChange={(value) => handleZoneChange(index, value)}
              style={styles.input}
              dropdownIconColor="#A45B17"
            >
              <Picker.Item label="Sélectionnez une zone" value="" />
              {zones.map((zone, idx) => (
                <Picker.Item key={idx} label={zone} value={zone} />
              ))}
            </Picker>

            <Text style={styles.inputLabel}>Type de Brique</Text>
            <Picker
              selectedValue={sub.brick_type}
              onValueChange={(value) => handleBrickTypeChange(index, value)}
              style={styles.input}
              dropdownIconColor="#A45B17"
            >
              <Picker.Item label="Sélectionnez un type" value="" />
              {brickTypes.map((type, idx) => (
                <Picker.Item key={idx} label={type} value={type} />
              ))}
            </Picker>

            <Text style={styles.sectionTitle}>Modifier les Poids</Text>

            {sub.weights.length === 0 && (
              <Text style={{ color: '#a00', marginBottom: 10 }}>
                Veuillez sélectionner un type de brique pour saisir les poids.
              </Text>
            )}

            <FlatList
              data={sub.weights}
              keyExtractor={(_, i) => i.toString()}
              numColumns={2}
              columnWrapperStyle={styles.row}
              renderItem={({ item, index: weightIndex }) => (
                <TextInput
                  style={styles.weightInput}
                  value={item}
                  onChangeText={(text) => handleWeightChange(index, weightIndex, text)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              )}
            />

            <Text style={styles.averageText}>
              ⚖️ Poids Moyen: <Text style={styles.averageValue}>{sub.average_weight} kg</Text>
            </Text>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>💾 Enregistrer</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('Home')}
          disabled={saving}
        >
          <Text style={styles.buttonText}>Fermer</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#A45B17',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  subCard: {
    backgroundColor: '#F8EDE3',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#A45B17',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#A45B17',
    borderBottomColor: '#A45B17',
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  inputLabel: {
    fontWeight: '600',
    color: '#7a3e0a',
    marginTop: 8,
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#d4bfa3',
    borderRadius: 8,
    height: 45,
    paddingHorizontal: 10,
    color: '#333',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 8,
    color: '#A45B17',
  },
  row: {
    justifyContent: 'space-between',
  },
  weightInput: {
    width: '48%',
    backgroundColor: '#FFF',
    borderColor: '#d4bfa3',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
    color: '#333',
    fontWeight: '600',
  },
  averageText: {
    marginTop: 10,
    fontWeight: '600',
    fontSize: 15,
    color: '#7a3e0a',
  },
  averageValue: {
    color: '#A45B17',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#A45B17',
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 17,
  },
  closeButton: {
    backgroundColor: '#7a3e0a',
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 5,
    alignItems: 'center',
  },
});
