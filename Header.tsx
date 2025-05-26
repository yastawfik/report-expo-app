import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashboardIcon from '@mui/icons-material/Dashboard';

type HeaderProps = {
  onLogout: () => void;
  userInitial: string;
};


const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Header({ onLogout }: HeaderProps) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [userInitial, setUserInitial] = useState('U');
  const [username, setUsername] = useState('Utilisateur');
  const sidebarAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        if (user?.name) {
          setUserInitial(user.name[0].toUpperCase());
          setUsername(user.name);
        }
      } catch (error) {
        console.error('❌ Error reading user from storage:', error);
      }
    };

    fetchUser();
  }, []);

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
        <MaterialIcons name="menu" size={32} color="#fff" />
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
            <Text style={styles.sidebarWelcome}>Bienvenue, {username}!</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Menu Items */}
         {Platform.OS === 'web' && (
         <TouchableOpacity
           style={styles.sidebarItem}
           onPress={() => {
            closeSidebar();
            navigation.navigate('DashBoard');
            }}
            >
              <MaterialIcons name="dashboard" size={22} color="#A45B17" />
              <Text style={styles.sidebarText}>DashBoard</Text>
            </TouchableOpacity>
)}
    
  
          
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
    height: 65,
    paddingHorizontal: 16,
    backgroundColor: '#A45B17',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#A45B17',
    fontWeight: 'bold',
    fontSize: 18,
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
  top: 65,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#00000055', // lighter semi-transparent black
},
  sidebar: {
    position: 'absolute',
    top: 38,
    bottom: 0,
    width: 280,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 16,
   elevation: 0,
  shadowColor: 'transparent',
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
