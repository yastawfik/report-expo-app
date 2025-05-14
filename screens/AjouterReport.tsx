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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const brickTypeFields = {
  'B8-25': 8,
  B10: 4,
  B12: 6,
};

type BrickType = keyof typeof brickTypeFields;
type SubReport = {
  zone: string | null;
  brickType: BrickType | null;
  brickWeights: string[];
  averageWeight: string;
};

const zones = ['Séchoir', 'Zone 2', 'Zone 3'];
const shifts = ['7-15', '15-23', '23-7'];

const AjouterReport = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [shift, setShift] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [zoneForms, setZoneForms] = useState<SubReport[]>([]);

  const handleAddZoneForm = () => {
    if (zoneForms.length >= 3) return;
    setZoneForms([...zoneForms, { zone: null, brickType: null, brickWeights: [], averageWeight: '' }]);
  };

  const handleZoneSelect = (index: number, zone: string) => {
    const updated = [...zoneForms];
    updated[index].zone = zone;
    setZoneForms(updated);
  };

  const handleBrickTypeSelect = (index: number, type: BrickType) => {
    const updated = [...zoneForms];
    updated[index].brickType = type;
    updated[index].brickWeights = Array(brickTypeFields[type]).fill('');
    setZoneForms(updated);
  };

  const handleWeightChange = (formIndex: number, weightIndex: number, value: string) => {
    const updated = [...zoneForms];
    updated[formIndex].brickWeights[weightIndex] = value;
    const validWeights = updated[formIndex].brickWeights.filter(w => w.trim() !== '' && !isNaN(Number(w)));
    if (validWeights.length === updated[formIndex].brickWeights.length) {
      const sum = updated[formIndex].brickWeights.reduce((acc, w) => acc + parseFloat(w), 0);
      updated[formIndex].averageWeight = (sum / validWeights.length).toFixed(2);
    } else {
      updated[formIndex].averageWeight = '';
    }
    setZoneForms(updated);
  };

 const handleSubmit = async () => {
  if (!shift) {
    Alert.alert('Erreur', 'Veuillez sélectionner un shift.');
    return;
  }

  if (zoneForms.length === 0) {
    Alert.alert('Erreur', 'Veuillez ajouter au moins une zone.');
    return;
  }

  const incomplete = zoneForms.some(
    (form) =>
      !form.zone ||
      !form.brickType ||
      form.brickWeights.some((w) => w.trim() === '' || isNaN(Number(w))) ||
      isNaN(Number(form.averageWeight))
  );

  if (incomplete) {
    Alert.alert('Erreur', 'Veuillez remplir tous les champs correctement.');
    return;
  }

  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Erreur', 'Utilisateur non authentifié');
      return;
    }

    const subreports = zoneForms.map((form) => ({
      zone: form.zone,
      brick_type: form.brickType,
      weights: form.brickWeights.map(w => parseFloat(w)),
      average_weight: parseFloat(form.averageWeight.toString()),
    }));

    const payload = {
      shift,
      datetime: date.toISOString(),
      subreports,
    };

    const response = await axios.post('http://192.168.103.50:8000/api/reports', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    navigation.navigate('Home', { newReport: response.data });
    Alert.alert('Succès', 'Rapport enregistré avec succès.');
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    Alert.alert('Erreur', 'Échec de l\'enregistrement du rapport');
  }
};
  const usedZones = zoneForms.map((f) => f.zone).filter(Boolean);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* DATE & TIME */}
      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputBox}>
          <Text>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(_, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Heure</Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.inputBox}>
          <Text>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={(_, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setTime(selectedTime);
            }}
          />
        )}
      </View>

      {/* SHIFT */}
      <View style={styles.section}>
        <Text style={styles.label}>Shift</Text>
        <View style={styles.zoneButtonsContainer}>
          {shifts.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.zoneButton, shift === s && styles.selectedButton]}
              onPress={() => setShift(s)}
            >
              <Text style={styles.zoneButtonText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* SUBREPORTS */}
      {zoneForms.map((form, index) => (
        <View key={index} style={[styles.section, { borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 20 }]}>
          <Text style={styles.label}>Zone {index + 1}</Text>
          <View style={styles.zoneButtonsContainer}>
            {zones.map((z) => {
              const isDisabled = usedZones.includes(z) && form.zone !== z;
              return (
                <TouchableOpacity
                  key={z}
                  style={[
                    styles.zoneButton,
                    form.zone === z && styles.selectedButton,
                    isDisabled && { opacity: 0.4 },
                  ]}
                  onPress={() => !isDisabled && handleZoneSelect(index, z)}
                  disabled={isDisabled}
                >
                  <Text style={styles.zoneButtonText}>{z}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Type de Briques</Text>
          <View style={styles.zoneButtonsContainer}>
            {Object.keys(brickTypeFields).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.zoneButton, form.brickType === type && styles.selectedButton]}
                onPress={() => handleBrickTypeSelect(index, type as BrickType)}
              >
                <Text style={styles.zoneButtonText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {form.brickType && (
            <>
              <Text style={styles.label}>Poids des briques (kg)</Text>
              {form.brickWeights.map((w, i) => (
                <TextInput
                  key={i}
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder={`Poids ${i + 1}`}
                  value={w}
                  onChangeText={(t) => handleWeightChange(index, i, t)}
                />
              ))}
              <Text style={styles.average}>Poids Moyen: {form.averageWeight || '0'} kg</Text>
            </>
          )}
        </View>
      ))}

      {/* ADD NEW ZONE */}
      {zoneForms.length < 3 && (
        <TouchableOpacity onPress={handleAddZoneForm} style={styles.plusButton}>
          <Text style={styles.plusButtonText}>＋</Text>
        </TouchableOpacity>
      )}

      {/* SUBMIT */}
      <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Enregistrer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
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
  selectedButton: { backgroundColor: '#A45B17' },
  zoneButtonText: { fontSize: 16, color: '#333' },
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
    marginVertical: 10,
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
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  plusButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#A45B17',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
  },
  plusButtonText: { color: 'white', fontSize: 30, fontWeight: 'bold' },
});

export default AjouterReport;
