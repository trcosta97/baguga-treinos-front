import { Redirect } from 'expo-router';

export default function Index() {
  // Certifique-se de que o redirecionamento só ocorre após o layout estar pronto
  return <Redirect href="/login" />;
}
