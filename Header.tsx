import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

type HeaderProps = {
  userInitial: string;
  onLogout: () => void;
};


export default function Header({ userInitial, onLogout }: HeaderProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [reports, setReports] = useState<any[]>([]);  // State to store reports
  const [reportsModalVisible, setReportsModalVisible] = useState(false); // For showing the reports modal
 const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* Hamburger Menu Icon */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <MaterialIcons name="menu" size={28} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Rapport Dosage</Text>

      {/* User Avatar Circle */}
      <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
      </TouchableOpacity>

      {/* Modal for hamburger menu options */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <View style={styles.menu}>
            {/* Option 1: Fetch all reports */}
            <TouchableOpacity 
            onPress={() => navigation.navigate('AllReportsScreen')} 
            style={styles.menuItem}>
              <Text style={styles.menuText}>Tous Les Rapports</Text>
            </TouchableOpacity>

            {/* Option 2 */}
            <TouchableOpacity onPress={() => console.log('Option 2 clicked')} style={styles.menuItem}>
              <Text style={styles.menuText}>Mes Rapports</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Modal for avatar menu (with logout option) */}
      <Modal
        transparent
        animationType="fade"
        visible={avatarModalVisible}
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <Pressable style={styles.avatarOverlay} onPress={() => setAvatarModalVisible(false)}>
          <View style={styles.avatarMenu}>
            {/* Logout option for avatar */}
            <TouchableOpacity onPress={onLogout} style={styles.menuItem}>
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Modal for displaying all reports */}
      <Modal
        transparent
        animationType="slide"
        visible={reportsModalVisible}
        onRequestClose={() => setReportsModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setReportsModalVisible(false)}>
          <View style={styles.reportsMenu}>
            <FlatList
              data={reports}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.reportItem}>
                  <Text style={styles.reportText}>Zone: {item.zone}</Text>
                  <Text style={styles.reportText}>Brick Type: {item.brick_type}</Text>
                  <Text style={styles.reportText}>Created By: {item.user?.name}</Text>
                  <Text style={styles.reportText}>Date: {item.created_at.split('T')[0]}</Text>
                </View>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: '#A45B17',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#A45B17',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 60,
    marginLeft: 16,
  },
  avatarOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginTop: 60,
    marginRight: 16,
  },
  avatarMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: 200,
    marginTop: 60,
    marginLeft: 16,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#A45B17',
  },
  reportsMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 60,
    marginLeft: 16,
    width: '90%',
  },
  reportItem: {
    marginBottom: 10,
  },
  reportText: {
    fontSize: 16,
    color: '#A45B17',
  },
});
