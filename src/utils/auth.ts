export interface AuthResponse {
    token: string;
}

export async function login(username: string, password: string): Promise<string> {
    console.log('LOGIN:', JSON.stringify({username, password}));
    const response = await fetch('http://127.0.0.1:8000/api-token-auth/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error('Credenciales invalidas');
    }

    const data: AuthResponse = await response.json();
    return data.token;
}