import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Provider as PaperProvider } from 'react-native-paper';
function AppInnerLayout() {
  console.log('AppInnerLayout rendered');
  const colorScheme = useColorScheme();
  const { userToken, isLoading } = useAuth();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  

  if (!loaded || isLoading) return null;
  console.log('User token:', userToken);
  console.log('Color scheme:', (!userToken ? "login": "tabs"));

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />          // neutral redirector
        <Stack.Screen name="login" />          // login page
        <Stack.Screen name="register" options={{ presentation: 'modal' }}/>
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="tabs" />
        <Stack.Screen name="custom-metric/[id]" options={{ presentation: 'modal' }}/>
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <AppInnerLayout />
      </AuthProvider>
    </PaperProvider>
  );
}
