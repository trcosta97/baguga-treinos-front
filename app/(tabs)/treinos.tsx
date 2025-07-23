import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/auth'; // Verifique se o caminho para o seu contexto está correto
import BASE_URL from '../../config'; // Verifique se o caminho para sua config está correto

// --- Interfaces para Tipagem dos Dados da API ---

interface Exercise {
  id: number;
  name: string;
  description: string;
}

interface ExerciseSet {
  id: number;
  repetitions: number;
  weight: number;
  exercise: Exercise;
}

interface Workout {
  name: string;
  exercises: Exercise[];
  exerciseSets: ExerciseSet[];
  registerTime: string; // Formato de data como string (ISO 8601)
}


// --- Componente do Card de Treino (Simplificado) ---

const WorkoutCard = ({ workout }: { workout: Workout }) => {
  const date = new Date(workout.registerTime);
  // Formata a data para o padrão brasileiro (dd/mm/yyyy)
  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <Text style={styles.workoutName}>{workout.name}</Text>
      <Text style={styles.workoutDate}>{formattedDate}</Text>
    </View>
  );
};


// --- Componente Principal da Página de Treinos ---

export default function TreinosScreen() {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkouts = async () => {
      if (!token) {
        setLoading(false);
        setError("Token não encontrado. Faça o login novamente.");
        return;
      }

      try {
        setLoading(true);
        const userId = await AsyncStorage.getItem('@BagugaTreino:userId');
        if (!userId) {
          throw new Error('ID do usuário não encontrado.');
        }

        const response = await fetch(`${BASE_URL}workout/getAll/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Erro ao buscar treinos: ${response.statusText}`);
        }

        const data: Workout[] = await response.json();
        setWorkouts(data);
        setError(null); // Limpa erros anteriores em caso de sucesso

      } catch (err: any) {
        console.error("Erro ao carregar treinos:", err);
        setError(err.message || 'Não foi possível carregar os treinos.');
      } finally {
        setLoading(false);
      }
    };

    loadWorkouts();
  }, [token]); // Roda o efeito sempre que o token mudar

  // --- Renderização Condicional ---

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Carregando treinos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Últimos treinos</Text>
      {workouts.length > 0 ? (
        <FlatList
          data={workouts}
          renderItem={({ item }) => <WorkoutCard workout={item} />}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.center}>
            <Text>Nenhum treino encontrado.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// --- Estilos ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Um cinza claro para o fundo
  },
  center: {
    flex: 1, // Faz o container centralizado ocupar todo o espaço disponível
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
  },
});
