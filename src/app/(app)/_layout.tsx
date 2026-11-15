import { Stack } from 'expo-router';

import { useAppTheme } from '@/theme';

export default function AppLayout() {
  const c = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        contentStyle: { backgroundColor: c.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Tarjetas' }} />
      <Stack.Screen name="details" options={{ title: 'Detalle' }} />
      <Stack.Screen name="form" options={{ title: 'Producto' }} />
    </Stack>
  );
}