import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, FlatList, ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { RootStackParamList, Report } from '../type';

type EditScreenRouteProp = RouteProp<RootStackParamList, 'EditReport'>;
type EditScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditReport'>;

export default function EditScreen() {
  const route = useRoute<EditScreenRouteProp>();
  const navigation = useNavigation<EditScreenNavigationProp>();
  const { report } = route.params;

  const [subReports, setSubReports] = useState<any[]>([]);

  const zones = ['Séchoir', 'Zone 2', 'Zone 3'];
  const brickTypes = ['B8-25', 'B10', 'B12'];

  useEffect(() => {
    if (report.subreports) {
      const parsed = report.subreports.map((sub: any) => {
        let weights = [];
        try {
          weights = typeof sub.weights === 'string' ? JSON.parse(sub.weights) : sub.weights;
        } catch {
          weights = [];
        }
        return {
          id: sub.id,
          zone: sub.zone,
          brick_type: sub.brick_type,
          weights: weights.map((w: number) => w.toString()),
          average_weight: sub.average_weight,
        };
      });
      setSubReports(parsed);
    }
  }, []);

  const calculateAverage = (weights: string[]) => {
    const numeric = weights.map(w => parseFloat(w)).filter(w => !isNaN(w));
    const avg = numeric.reduce((acc, cur) => acc + cur, 0) / (numeric.length || 1);
    return Number(avg.toFixed(2));
  };

  const handleWeightChange = (index: number, weightIndex: number, value: string) => {
    const updated = [...subReports];
    updated[index].weights[weightIndex] = value;
    updated[index].average_weight = calculateAverage(updated[index].weights);
    setSubReports(updated);
  };

  const handleBrickTypeChange = (index: number, value: string) => {
    const fieldCount = value === 'B8-25' ? 8 : value === 'B10' ? 4 : value === 'B12' ? 6 : 0;
    const updated = [...subReports];
    updated[index].brick_type = value;
    updated[index].weights = Array(fieldCount).fill('');
    updated[index].average_weight = 0;
    setSubReports(updated);
  };

  const handleUpdate = async () => {
    try {
      for (let sub of subReports) {
        await axios.put(`http://192.168.103.50:8000/api/reports/${sub.id}`, {
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
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Modifier le Rapport</Text>

      <Text style={styles.label}>📅 Date: {report.created_at.split('T')[0]}</Text>
      <Text style={styles.label}>👤 Fait Par: {report?.user?.name || 'Inconnu'}</Text>

      {subReports.map((sub, index) => (
        <View key={index} style={styles.subCard}>
          <Text style={styles.subTitle}>🧱 Zone {index + 1}</Text>

          <Picker
            selectedValue={sub.zone}
            onValueChange={(value) => {
              const updated = [...subReports];
              updated[index].zone = value;
              setSubReports(updated);
            }}
            style={styles.input}
          >
            {zones.map((zone, idx) => (
              <Picker.Item key={idx} label={zone} value={zone} />
            ))}
          </Picker>

          <Picker
            selectedValue={sub.brick_type}
            onValueChange={(value) => handleBrickTypeChange(index, value)}
            style={styles.input}
          >
            {brickTypes.map((type, idx) => (
              <Picker.Item key={idx} label={type} value={type} />
            ))}
          </Picker>

          <Text style={styles.sectionTitle}>Modifier les Poids</Text>

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
              />
            )}
          />

          <Text style={styles.averageText}>
            ⚖️ Nouveau Poids Moyen: <Text style={styles.averageValue}>{sub.average_weight} kg</Text>
          </Text>
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Text style={styles.buttonText}>💾 Enregistrer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Fermer</Text>
      </TouchableOpacity>
    </ScrollView>
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
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  subCard: {
    backgroundColor: '#F8EDE3',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
    color: '#A45B17',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#A45B17',
  },
  row: {
    justifyContent: 'space-between',
  },
  weightInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0C3A0',
    borderRadius: 10,
    padding: 10,
    width: '47%',
    marginBottom: 10,
  },
  averageText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 5,
  },
  averageValue: {
    fontWeight: 'bold',
    color: '#A45B17',
  },
  saveButton: {
    backgroundColor: '#A45B17',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#7a0012',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
