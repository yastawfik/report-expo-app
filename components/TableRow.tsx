// TableRow.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Report = {
  date: string;
  time: string;
  username: string;
};

type TableRowProps = {
  report: Report;
  onEyeClick: () => void;
};

const TableRow: React.FC<TableRowProps> = ({ report, onEyeClick }) => (
  <View style={styles.row}>
    <Text style={styles.cell}>{report.date}</Text>
    <Text style={styles.cell}>{report.time}</Text>
    <Text style={styles.cell}>{report.username}</Text>
    <TouchableOpacity onPress={onEyeClick} style={styles.eyeButton}>
      <Ionicons name="eye-outline" size={20} color="#2563eb" />
    </TouchableOpacity>
  </View>
);

export default TableRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,   // SAME as header paddingHorizontal!
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    paddingHorizontal: 12,
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  eyeButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
