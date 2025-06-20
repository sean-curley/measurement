import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function AppInnerLayout() {
  console.log('AppInnerLayout rendered');
  const colorScheme = useColorScheme();
  const { userToken, isLoading } = useAuth();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  
  if (!loaded || isLoading) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {!userToken ? (
          <>
            <Stack.Screen name="index" />
            <Stack.Screen name="register" />
            <Stack.Screen name="forgot-password" />
          </>
        ) : (
          <Stack.Screen name="tabs/index" />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppInnerLayout />
    </AuthProvider>
  );
}
