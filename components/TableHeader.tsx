// TableHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type TableHeaderProps = {
  headers: string[];
};

const TableHeader: React.FC<TableHeaderProps> = ({ headers }) => {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>{headers[0]}</Text>
      </View>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>{headers[1]}</Text>
      </View>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>{headers[2]}</Text>
      </View>
      <View style={styles.actionCell}>
        <Text style={styles.headerText}>{headers[3]}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 16,    // SAME as row paddingHorizontal!
  },
  headerCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
  },
  actionCell: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
  },
});

export default TableHeader;
