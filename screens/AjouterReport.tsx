import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
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

const zones = ['Séchoir', 'Four', 'Monobloc'];
const shifts = ['7-15', '15-23', '23-7'];

const HEADER_HEIGHT = 20;
const SUB_HEADER_HEIGHT = 0;
const TOP_OFFSET = HEADER_HEIGHT + SUB_HEADER_HEIGHT;


const AjouterReport = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [shift, setShift] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [zoneForms, setZoneForms] = useState<SubReport[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleAddZoneForm = () => {
    if (zoneForms.length >= 3) return;
    setZoneForms([...zoneForms, { zone: null, brickType: null, brickWeights: [], averageWeight: '' }]);
  };

  const handleZoneSelect = (index: number, zone: string) => {
    const updated = [...zoneForms];
    updated[index].zone = zone;
    setZoneForms(updated);

    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`zone-${index}`];
      return newErrors;
    });
  };

  const handleBrickTypeSelect = (index: number, type: BrickType) => {
    const updated = [...zoneForms];
    updated[index].brickType = type;
    updated[index].brickWeights = Array(brickTypeFields[type]).fill('');
    updated[index].averageWeight = '';
    setZoneForms(updated);

    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`brickType-${index}`];
      return newErrors;
    });
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

    // Clear error if the value is now valid
    if (value.trim() !== '' && !isNaN(Number(value))) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`weight-${formIndex}-${weightIndex}`];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    const errors: { [key: string]: string } = {};

    if (!shift) errors.shift = 'Veuillez sélectionner un shift.';
    if (zoneForms.length === 0) errors.zone = 'Veuillez ajouter au moins une zone.';

    zoneForms.forEach((form, i) => {
      if (!form.zone) errors[`zone-${i}`] = 'Zone requise.';
      if (!form.brickType) errors[`brickType-${i}`] = 'Type de brique requis.';
      form.brickWeights.forEach((w, j) => {
        if (w.trim() === '' || isNaN(Number(w))) {
          errors[`weight-${i}-${j}`] = `Poids ${j + 1} invalide.`;
        }
      });
    });

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      Alert.alert('Erreur', 'Veuillez corriger les champs indiqués.');
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
        average_weight: parseFloat(form.averageWeight),
      }));

      const payload = {
        shift,
        datetime: new Date().toISOString().slice(0, 19).replace("T", " "),
        subreports,
      };

      const response = await axios.post('http://192.168.103.24:8000/api/reports', payload, {
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
    <View style={{ flex: 1 }}>
        <ScrollView
           style={[styles.scrollView, { position: 'absolute', top: TOP_OFFSET, bottom: 0, left: 0, right: 0 }]}
           contentContainerStyle={styles.contentContainer}
           showsVerticalScrollIndicator
         >
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

        <View style={styles.section}>
          <Text style={styles.label}>Shift</Text>
          <View style={styles.zoneButtonsContainer}>
            {shifts.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.zoneButton, shift === s && styles.selectedButton]}
                onPress={() => {
                  setShift(s);
                  setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.shift;
                    return newErrors;
                  });
                }}
              >
                <Text style={styles.zoneButtonText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {fieldErrors.shift && <Text style={styles.errorText}>{fieldErrors.shift}</Text>}
        </View>

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
            {fieldErrors[`zone-${index}`] && <Text style={styles.errorText}>{fieldErrors[`zone-${index}`]}</Text>}

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
            {fieldErrors[`brickType-${index}`] && <Text style={styles.errorText}>{fieldErrors[`brickType-${index}`]}</Text>}

            {form.brickType && (
              <>
                <Text style={styles.label}>Poids des briques (kg)</Text>
                {form.brickWeights.map((w, i) => (
                  <View key={i}>
                    <TextInput
                      style={[
                        styles.input,
                        fieldErrors[`weight-${index}-${i}`] && { borderColor: 'red' },
                      ]}
                      keyboardType="numeric"
                      placeholder={`Poids ${i + 1}`}
                      value={w}
                      onChangeText={(t) => handleWeightChange(index, i, t)}
                    />
                    {fieldErrors[`weight-${index}-${i}`] && (
                      <Text style={styles.errorText}>{fieldErrors[`weight-${index}-${i}`]}</Text>
                    )}
                  </View>
                ))}
                <Text style={styles.average}>Poids Moyen: {form.averageWeight || '0'} kg</Text>
              </>
            )}
          </View>
        ))}

        {zoneForms.length < 3 && (
          <TouchableOpacity onPress={handleAddZoneForm} style={styles.plusButton}>
            <Text style={styles.plusButtonText}>＋</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
        <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Fermer</Text>
              </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 20, flexGrow: 1 },
  section: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  zoneButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-evenly',
    marginTop: 10,
  },
        scrollView: {
    backgroundColor: '#f4f4f4',
  },
      contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -5,
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

export default AjouterReport;
