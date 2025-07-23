import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/auth';
import { fetchUserData } from '../utils/fetchUserData'; // Verifique se o caminho está correto
import { fetchUserWorkouts } from '../utils/fetchUserWorkouts'; // Verifique se o caminho está correto

// Define a interface do usuário para clareza
interface User {
  name: string;
  birthday: string;
  email: string;
}

const HomeScreen = () => {
  const { token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Começa carregando

  useEffect(() => {
    const loadAllData = async () => {
      // Se não houver token, não há o que fazer.
      if (!token) {
        setError('Sessão inválida. Por favor, faça o login novamente.');
        setLoading(false);
        return;
      }

      try {
        // Pega o ID do usuário do armazenamento
        const userId = await AsyncStorage.getItem('@BagugaTreino:userId');
        if (!userId) {
          throw new Error('ID do usuário não foi encontrado no dispositivo.');
        }

        // Com token e userId em mãos, busca os dados na API
        const userData = await fetchUserData(token, userId);
        if (!userData) {
          throw new Error('O servidor não retornou os dados do usuário.');
        }

        const userWorkouts = await fetchUserWorkouts(token, userId);
        if (!userWorkouts) {
          throw new Error('O servidor não retornou os dados dos treinos do usuário.');
        }

        setUser(userData);
        setWorkouts(userWorkouts);

      } catch (err: any) {
        console.error("Erro ao carregar dados da HomeScreen:", err);
        setError(err.message || 'Ocorreu um erro ao buscar suas informações.');
      } finally {
        // ESSENCIAL: Garante que o "loading" termine, não importa se deu certo ou errado
        setLoading(false);
      }
    };

    loadAllData();
  }, [token]); // O efeito roda quando o token estiver disponível

  // --- Lógica de Renderização ---

  // 1. Enquanto estiver carregando, mostra o indicador
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  // 2. Se deu algum erro, mostra o erro
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Mostra os dados do usuário e os últimos treinos
  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.greeting}>Olá, {user.name}!</Text>
        {/* Exibe as informações do usuário */}
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Nome:</Text>
          <Text style={styles.infoValue}>{user.name}</Text>
          <Text style={styles.infoLabel}>Aniversário:</Text>
          <Text style={styles.infoValue}>{user.birthday}</Text>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>
        {/*Exibe os últimos treinos do usuário */}
        <View>
          <Text style={styles.infoLabel}>Últimos treinos:</Text>
          {workouts.length > 0 ? (
            workouts.slice(0, 5).map((workout, index) => {
              const date = new Date(workout.registerTime);
              const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

              return (
                <Text key={index} style={styles.infoValue}>
                  {workout.name} - {formattedDate}
                </Text>
              );
            })
          ) : (
            <Text style={styles.infoValue}>Nenhum treino encontrado.</Text>
          )}
        </View>
      </View>
    );
  }

  // 4. Fallback: se não estiver carregando, não tiver erro, mas não tiver usuário
  return (
    <View style={styles.container}>
      <Text>Não foi possível carregar as informações.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  infoBox: {
    width: '100%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  infoValue: {
    fontSize: 18,
    color: '#000',
    marginBottom: 5,
  },
});

export default HomeScreen;