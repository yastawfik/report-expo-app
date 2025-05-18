import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type HeaderProps = {
  userInitial: string;
  onLogout: () => void;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Header({ userInitial, onLogout }: HeaderProps) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const navigation = useNavigation<any>();

  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.timing(sidebarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: -SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setSidebarVisible(false));
  };

  return (
    <View style={styles.container}>
      {/* Hamburger Icon */}
      <TouchableOpacity onPress={openSidebar}>
        <MaterialIcons name="menu" size={28} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Rapport Dosage</Text>

      {/* Avatar */}
      <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
      </TouchableOpacity>

      {/* Sidebar Modal */}
      <Modal transparent visible={sidebarVisible} animationType="none">
        <Pressable style={styles.backdrop} onPress={closeSidebar} />
        <Animated.View style={[styles.sidebar, { left: sidebarAnim }]}>
          {/* Sidebar Header with User Info */}
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarAvatar}>
              <Text style={styles.sidebarAvatarText}>{userInitial}</Text>
            </View>
            <Text style={styles.sidebarWelcome}>Bienvenue!</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Menu Items */}
       <TouchableOpacity
  style={styles.sidebarItem}
  onPress={() => {
    closeSidebar();
    navigation.navigate('AllReports', { headerTitle: 'Historique générale' });
  }}
>
  <MaterialIcons name="list-alt" size={22} color="#A45B17" />
  <Text style={styles.sidebarText}>Tous les Rapports</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.sidebarItem}
  onPress={() => {
    closeSidebar();
    navigation.navigate('Home', { newReport: true, headerTitle: 'Historique de Mes Rapports' });
  }}
>
  <MaterialIcons name="assignment" size={22} color="#A45B17" />
  <Text style={styles.sidebarText}>Mes Rapports</Text>
</TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* Avatar Menu */}
      <Modal
        transparent
        animationType="fade"
        visible={avatarModalVisible}
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <Pressable
          style={styles.avatarOverlay}
          onPress={() => setAvatarModalVisible(false)}
        >
          <View style={styles.avatarMenu}>
            <TouchableOpacity onPress={onLogout} style={styles.menuItem}>
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
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
  menuItem: {
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#A45B17',
  },
  backdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#00000099',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 16,
    elevation: 5,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  sidebarHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sidebarAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#A45B17',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sidebarAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sidebarWelcome: {
    fontSize: 16,
    color: '#A45B17',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  sidebarText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
});
