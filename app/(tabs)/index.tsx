import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/auth';
import { fetchUserData } from '../utils/fetchUserData';

const HomeScreen = () => {
  const { token } = useAuth();
  const [user, setUser] = useState<{ name: string; birthday: string; email: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserId() {
      const storedUserId = await AsyncStorage.getItem('@BagugaTreino:userId');
      console.log('Stored User ID:', storedUserId); // Verifique o ID do usuário armazenado
      setUserId(storedUserId);
    }

    loadUserId();
  }, []);

  useEffect(() => {
    async function loadUserData() {
      if (token && userId) {
        console.log('Fetching user data for ID:', userId); // Verifique o ID do usuário antes de buscar os dados
        const userData = await fetchUserData(token, userId);
        console.log('Fetched user data:', userData); // Verifique os dados do usuário
        setUser(userData);
      }
    }

    loadUserData();
  }, [token, userId]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  console.log('Rendering user data:', user); // Adicione log para verificar a renderização

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Nome: {user?.name}</Text>
      <Text style={styles.text}>Aniversário: {user?.birthday}</Text>
      <Text style={styles.text}>Email: {user?.email}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginVertical: 10,
  },
});

export default HomeScreen;
