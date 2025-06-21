// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { userToken } = useAuth();
  console.log('Index component rendered, userToken:', userToken);

  return <Redirect href={userToken ? '/tabs' : '/login'} />;
}
