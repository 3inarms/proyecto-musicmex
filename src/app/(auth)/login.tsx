import { saveToken } from '@/utils/tokenStorage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { login } from '../../utils/auth';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Completa todos los campos');
            return;
        }

        try {
            setLoading(true);
            const token = await login(username, password);
            await saveToken(token);
            router.replace('/');
        } catch (error) {
            Alert.alert('Error', 'Usuario o contraseña incorrectos');
        } finally {
            setLoading(false);
        }

    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar Sesión</Text>

            <TextInput
                placeholder="Usuario"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <Pressable onPress={handleLogin} disabled={loading}>
                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                )}
            </Pressable>
            <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={{ marginTop: 16 }}
        >
        {loading ? (
            <ActivityIndicator color="#007AFF" />
        ) : (
            <Text style={styles.buttonText}>Entrar</Text>
        )}
        </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 16,
        padding: 12,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        padding: 12,
        textAlign: 'center',
    },
});
