import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, RefObject, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputInstance,
  TextInputProps,
  View,
} from 'react-native';

import { Palette, radius, spacing, useAppTheme } from '@/theme';
import { login } from '@/utils/auth';
import { saveToken } from '@/utils/tokenStorage';

type FieldProps = TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
  c: Palette;
  right?: ReactNode;
  inputRef?: RefObject<TextInputInstance | null>;
};

function Field({ icon, c, right, inputRef, ...props }: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.field,
        { backgroundColor: c.surface, borderColor: focused ? c.primary : c.border },
      ]}
    >
      <Ionicons name={icon} size={20} color={focused ? c.primary : c.muted} />
      <TextInput
        ref={inputRef}
        {...props}
        placeholderTextColor={c.muted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          { color: c.text },
          Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
        ]}
      />
      {right}
    </View>
  );
}

export default function LoginScreen() {
  const c = useAppTheme();
  const router = useRouter();
  const passwordRef = useRef<TextInputInstance>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (loading) return;
    if (!username.trim() || !password) {
      setError('Escribe tu usuario y tu contraseña.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = await login(username.trim(), password);
      await saveToken(token);
      router.replace('/');
    } catch (e) {
      setError(
        e instanceof Error && e.message === 'Credenciales invalidas'
          ? 'Usuario o contraseña incorrectos.'
          : 'No se pudo conectar con el servidor. Revisa tu conexión.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={[styles.title, { color: c.text }]}>Inicia sesión</Text>
          <Text style={[styles.subtitle, { color: c.muted }]}>
            Todo el merch de tus artistas favoritos
          </Text>

          <Field
            c={c}
            icon="person-outline"
            placeholder="Usuario"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            editable={!loading}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Field
            c={c}
            inputRef={passwordRef}
            icon="lock-closed-outline"
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            editable={!loading}
            onSubmitEditing={handleLogin}
            right={
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={10}
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={c.muted}
                />
              </Pressable>
            }
          />

          {!!error && (
            <View style={[styles.errorBox, { borderColor: c.danger }]}>
              <Ionicons name="alert-circle-outline" size={18} color={c.danger} />
              <Text style={[styles.errorText, { color: c.danger }]}>{error}</Text>
            </View>
          )}

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: c.primary, opacity: loading ? 0.6 : pressed ? 0.85 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={c.onPrimary} />
            ) : (
              <Text style={[styles.buttonText, { color: c.onPrimary }]}>Entrar</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  content: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  logo: { width: 220, height: 220, alignSelf: 'center', marginBottom: spacing.md },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 16, height: '100%' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { flex: 1, fontSize: 14 },
  button: {
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
});