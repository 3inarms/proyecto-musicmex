import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { deleteToken, getToken } from '../utils/tokenStorage';

export default function Index() {
    const [checking, setChecking] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        (async () => {
            await deleteToken();
            const token = await getToken();
            setIsLoggedIn(!!token);
            setChecking(false);
        });
    }, []);

    if (checking) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return isLoggedIn ? <Redirect href="/(app)" /> : <Redirect href="/(auth)/login" />;
}
