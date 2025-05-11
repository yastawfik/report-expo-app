import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../type';

type ReportFormRouteProp = RouteProp<RootStackParamList, 'ReportForm'>;

const ReportForm = () => {
  const { params } = useRoute<ReportFormRouteProp>();
  const { report } = params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Report</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={report.title}
        editable={false}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Content"
        value={report.content}
        multiline
        editable={false}
      />
    </View>
  );
};

export default ReportForm;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
});
