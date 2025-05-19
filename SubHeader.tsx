import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  onFilterPress?: () => void;
  title: string;
};

export default function SubHeader({ onFilterPress, title }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <MaterialCommunityIcons name="layers" size={24} color="#A45B17" />
        <Text style={styles.title}>{title}</Text>
      </View>
      {onFilterPress && (
        <TouchableOpacity onPress={onFilterPress}>
          <MaterialIcons name="filter-list" size={28} color="#A45B17" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 4, // Further reduced top padding
    paddingBottom: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#A45B17',
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
});