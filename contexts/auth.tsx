import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import BASE_URL from '../config';

interface AuthState {
  token: string | null;
  isLoading: boolean;
}

interface AuthContextData extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AuthState>({
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    async function loadStorageData() {
      const token = await AsyncStorage.getItem('@BagugaTreino:token');

      setData({ token, isLoading: false });
    }

    loadStorageData();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(BASE_URL + 'auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      const { token, userId } = await response.json();
      console.log('Login Response:', { token, userId }); // Verifique a resposta do login
  
      await AsyncStorage.setItem('@BagugaTreino:token', token);
      await AsyncStorage.setItem('@BagugaTreino:userId', userId.toString());
  
      const storedUserId = await AsyncStorage.getItem('@BagugaTreino:userId');
      console.log('Stored User ID after login:', storedUserId); // Verifique o ID do usuário armazenado
  
      setData({ token, isLoading: false });
    } catch (error) {
      console.error('Erro no login:', error); // Adicione log para erro
      throw error;
    }
  };
  
  
  


  const signOut = async () => {
    await AsyncStorage.removeItem('@BagugaTreino:token');
    setData({ token: null, isLoading: false });
  };

  if (data.isLoading) {
    // Exibe uma tela de carregamento até que o estado de autenticação seja inicializado
    return null; // Ou um componente de loading personalizado
  }

  return (
    <AuthContext.Provider value={{ ...data, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
