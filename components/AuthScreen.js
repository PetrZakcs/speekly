import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const AuthScreen = ({ t, onLoginSuccess, onCancel, colors }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    // Fallback colors if not provided
    const COLORS = colors || {
        BG_DARK: '#0F2822',
        ACCENT_LIME: '#D4EE9F',
        TEXT_DARK: '#0F2822',
        TEXT_SEC: '#AABEB8',
        ACCENT_ORANGE: '#F97316'
    };

    const handleAuth = async () => {
        setLoading(true);
        let error;
        try {
            if (isLogin) {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                error = signInError;
            } else {
                const { error: signUpError } = await supabase.auth.signUp({ email, password });
                error = signUpError;
            }
        } catch (e) {
            error = e;
        }

        setLoading(false);
        if (error) {
            Alert.alert('Error', error.message);
        } else {
            if (!isLogin) Alert.alert('Success', 'Account created! Please check your email.');
            if (onLoginSuccess) onLoginSuccess();
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 24, justifyContent: 'center', flexGrow: 1 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: COLORS.TEXT_DARK || '#000', marginBottom: 8, textAlign: 'center' }}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={{ fontSize: 16, color: COLORS.TEXT_SEC || '#666', marginBottom: 32, textAlign: 'center' }}>
                {isLogin ? 'Sign in to sync your streaks' : 'Join Speekly to save your progress'}
            </Text>

            <View style={{ gap: 16, maxWidth: 400, width: '100%', alignSelf: 'center' }}>
                <View>
                    <Text style={{ marginBottom: 6, fontWeight: '600', color: COLORS.TEXT_DARK }}>Email</Text>
                    <TextInput
                        style={{
                            backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, fontSize: 16
                        }}
                        placeholder="hello@example.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
                <View>
                    <Text style={{ marginBottom: 6, fontWeight: '600', color: COLORS.TEXT_DARK }}>Password</Text>
                    <TextInput
                        style={{
                            backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, fontSize: 16
                        }}
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    onPress={handleAuth}
                    disabled={loading || !email || !password}
                    style={{
                        backgroundColor: COLORS.ACCENT_LIME, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 8,
                        opacity: (loading || !email || !password) ? 0.7 : 1
                    }}
                >
                    {loading ? (
                        <Text style={{ fontWeight: 'bold', color: COLORS.TEXT_DARK }}>Loading...</Text>
                    ) : (
                        <Text style={{ fontWeight: 'bold', color: COLORS.TEXT_DARK, fontSize: 16 }}>
                            {isLogin ? 'Sign In' : 'Sign Up'}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ alignItems: 'center', padding: 12 }}>
                    <Text style={{ color: COLORS.TEXT_SEC }}>
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onCancel} style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={{ color: COLORS.TEXT_SEC, textDecorationLine: 'underline' }}>Maybe Later</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default AuthScreen;
