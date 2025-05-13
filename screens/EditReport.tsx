import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { Pressable } from 'react-native-gesture-handler';
import axios from 'axios';

import { RootStackParamList, Report } from '../type';

// Define route and navigation types
type EditScreenRouteProp = RouteProp<RootStackParamList, 'EditReport'>;
type EditScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditReport'>;

export default function EditScreen() {
  const route = useRoute<EditScreenRouteProp>();
  const navigation = useNavigation<EditScreenNavigationProp>();
  const { report } = route.params;

  const [zone, setZone] = useState(report.zone);
  const [brickType, setBrickType] = useState(report.brick_type);
  const [weights, setWeights] = useState<string[]>([]);
  const [average, setAverage] = useState(0);

  const zones = ['Séchoir', 'Zone 2', 'Zone 3'];
  const brickTypes = ['B8-25', 'B10'];

  useEffect(() => {
    try {
      const parsed = typeof report.weights === 'string' ? JSON.parse(report.weights) : report.weights;
      const stringWeights = parsed.map((w: number) => w.toString());
      setWeights(stringWeights);
    } catch {
      setWeights([]);
    }
  }, []);

  useEffect(() => {
    const numeric = weights.map(w => parseFloat(w)).filter(w => !isNaN(w));
    const avg = numeric.reduce((acc, cur) => acc + cur, 0) / (numeric.length || 1);
    setAverage(Number(avg.toFixed(2)));
  }, [weights]);

  const handleUpdate = async () => {
    try {
      const updatedReport = {
        zone,
        brick_type: brickType,
        weights: weights.map(w => parseFloat(w)),
      };

      await axios.put(`http://192.168.103.37:8000/api/reports/${report.id}`, updatedReport);
      Alert.alert('Succès', 'Rapport mis à jour.');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "La mise à jour a échoué.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Modifier le Rapport</Text>

      <View style={styles.card}>
        <Text style={styles.label}>📅 Date: {report.created_at.split('T')[0]}</Text>
        <Text style={styles.label}>👤 Fait Par: {report?.user?.name || 'Inconnu'}</Text>

        <Picker
          selectedValue={zone}
          onValueChange={setZone}
          style={styles.input}
        >
          {zones.map((zoneOption, index) => (
            <Picker.Item key={index} label={zoneOption} value={zoneOption} />
          ))}
        </Picker>

        <Picker
          selectedValue={brickType}
          onValueChange={setBrickType}
          style={styles.input}
        >
          {brickTypes.map((typeOption, index) => (
            <Picker.Item key={index} label={typeOption} value={typeOption} />
          ))}
        </Picker>
      </View>

      <Text style={styles.sectionTitle}>Modifier les Poids</Text>

      <FlatList
        data={weights}
        keyExtractor={(_, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => (
          <TextInput
            style={styles.weightInput}
            value={item}
            onChangeText={text => {
              const updated = [...weights];
              updated[index] = text;
              setWeights(updated);
            }}
            keyboardType="numeric"
          />
        )}
      />

      <Text style={styles.averageText}>
        ⚖️ Nouveau Poids Moyen: <Text style={styles.averageValue}>{average} kg</Text>
      </Text>

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Text style={styles.buttonText}>💾 Enregistrer</Text>
      </TouchableOpacity>

      <Pressable
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
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
  saveButton: {
    marginTop: 20,
    backgroundColor: '#A45B17',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#7a0012',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
});
