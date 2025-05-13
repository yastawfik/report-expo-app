import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../type'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // <-- Import the types

const brickTypeFields = {
  'B8-25': 8,
  B10: 4,
};

type BrickType = keyof typeof brickTypeFields;
const zones = ['Séchoir', 'Zone 2', 'Zone 3'];

const AjouterReport = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();  // <-- Provide the type here

  const [zone, setZone] = useState(zones[0]);
  const [brickType, setBrickType] = useState<BrickType>('B8-25');
  const [brickWeights, setBrickWeights] = useState(Array(brickTypeFields['B8-25']).fill(''));
  const [averageWeight, setAverageWeight] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    setBrickWeights(Array(brickTypeFields[brickType]).fill(''));
  }, [brickType]);

  useEffect(() => {
    if (brickWeights.every((w) => w.trim() !== '' && !isNaN(Number(w)))) {
      calculateAverageWeight();
    } else {
      setAverageWeight('');
    }
  }, [brickWeights]);

  const handleWeightChange = (text: string, index: number) => {
    const updated = [...brickWeights];
    updated[index] = text;
    setBrickWeights(updated);
  };

  const calculateAverageWeight = () => {
    const sum = brickWeights.reduce((acc, w) => acc + parseFloat(w || '0'), 0);
    setAverageWeight((sum / brickWeights.length).toFixed(2));
  };

  const isFormValid = brickWeights.every((w) => w.trim() !== '' && !isNaN(Number(w)));

// After the report is successfully added
const handleSubmit = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Erreur', 'Utilisateur non authentifié');
      return;
    }

    const datetime = new Date(date);
    datetime.setHours(time.getHours());
    datetime.setMinutes(time.getMinutes());

    const payload = {
      zone,
      brick_type: brickType,
      weights: brickWeights,
      average_weight: averageWeight,
      datetime: datetime.toISOString(),
    };

    // Make the request and wait for the backend to return the saved report
    const response = await axios.post('http://192.168.103.37:8000/api/reports', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const newReport = response.data;

    // Navigate back to Home screen *before* showing the alert
    navigation.navigate('Home', { newReport });

    // Optional: wait briefly before showing the success message
    setTimeout(() => {
      Alert.alert('Succès', 'Rapport enregistré avec succès');
    }, 500);
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    Alert.alert('Erreur', 'Échec de l\'enregistrement du rapport');
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Date Picker */}
      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputBox}>
          <Text>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="calendar"
            onChange={(_, selected) => {
              setShowDatePicker(false);
              if (selected) setDate(selected);
            }}
          />
        )}
      </View>

      {/* Time Picker */}
      <View style={styles.section}>
        <Text style={styles.label}>Heure</Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.inputBox}>
          <Text>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="clock"
            onChange={(_, selected) => {
              setShowTimePicker(false);
              if (selected) setTime(selected);
            }}
          />
        )}
      </View>

      {/* Zone Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Zone</Text>
        <View style={styles.zoneButtonsContainer}>
          {zones.map((z) => (
            <TouchableOpacity
              key={z}
              style={[styles.zoneButton, zone === z && styles.selectedButton]}
              onPress={() => setZone(z)}
            >
              <Text style={styles.zoneButtonText}>{z}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Type de Briques */}
      <View style={styles.section}>
        <Text style={styles.label}>Type de Briques</Text>
        <View style={styles.zoneButtonsContainer}>
          {Object.keys(brickTypeFields).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.zoneButton, brickType === type && styles.selectedButton]}
              onPress={() => setBrickType(type as BrickType)}
            >
              <Text style={styles.zoneButtonText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Brick Weights */}
      <View style={styles.section}>
        <Text style={styles.label}>Poids des briques (kg)</Text>
        {brickWeights.map((w, i) => (
          <TextInput
            key={i}
            style={styles.input}
            keyboardType="numeric"
            placeholder={`Poids ${i + 1}`}
            value={w}
            onChangeText={(t) => handleWeightChange(t, i)}
          />
        ))}
      </View>

      <Text style={styles.average}>Poids Moyen: {averageWeight || '–'} kg</Text>

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.saveButton, !isFormValid && styles.disabledButton]}
        disabled={!isFormValid}
      >
        <Text style={styles.saveButtonText}>Enregistrer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1, paddingBottom: 30 },
  section: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  zoneButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-evenly',
    marginTop: 10,
  },
  zoneButton: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  selectedButton: {
    backgroundColor: '#A45B17',
  },
  zoneButtonText: {
    fontSize: 16,
    color: '#333',
  },
  inputBox: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  average: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#A45B17',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default AjouterReport;
