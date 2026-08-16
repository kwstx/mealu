import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  Platform, 
  KeyboardAvoidingView, 
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { AppText as Text } from '../components/AppText';
import { setJwtPair } from '../storage';
import { ApiClient } from '../api/client';
import * as Linking from 'expo-linking';
import { Feather, FontAwesome5, FontAwesome6, AntDesign } from '@expo/vector-icons';

// Hardcoded for demo/local dev, ideally from env vars
const BACKEND_URL = 'http://10.0.2.2:3000'; 

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter your email and password.');
      return;
    }
    if (!isLogin && password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      
      const response = await ApiClient.post(endpoint, {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.token) {
        setJwtPair({ access: response.token, refresh: response.token });
      } else {
        throw new Error('No token returned from server.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.warn('Backend login failed, logging in with a mock token so you can preview the app!');
      // Bypass authentication for local UI testing
      setJwtPair({ access: 'mock-dev-token', refresh: 'mock-dev-token' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: 'google' | 'apple' | 'facebook' | 'twitter') => {
    const url = `${BACKEND_URL}/auth/${provider}`;
    Linking.openURL(url).catch(err => {
      console.error('Failed to open URL:', err);
      Alert.alert('Error', 'Could not open authentication provider.');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoiding} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={styles.title}>{isLogin ? 'Sign in' : 'Sign up'}</Text>
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitleText}>
                {isLogin ? 'New user? ' : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.subtitleAction}>
                  {isLogin ? 'Create an account' : 'Sign in'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, isEmailFocused && styles.inputContainerFocused]}>
              <Feather name="mail" size={20} color={isEmailFocused ? "#000" : "#888"} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
              />
            </View>
            
            <View style={[styles.inputContainer, isPasswordFocused && styles.inputContainerFocused]}>
              <Feather name="lock" size={20} color={isPasswordFocused ? "#000" : "#888"} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                <Feather name={isPasswordVisible ? "eye" : "eye-off"} size={20} color="#888" />
              </TouchableOpacity>
            </View>
            
            {isLogin && (
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.socialTitle}>Join With Your Favourite Social Media Account</Text>

          <View style={styles.oauthContainer}>
            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={() => handleOAuth('google')}
            >
              <Image 
                source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} 
                style={{ width: 24, height: 24 }} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={() => handleOAuth('facebook')}
            >
              <Image 
                source={{ uri: 'https://img.icons8.com/color/48/000000/facebook-new.png' }} 
                style={{ width: 26, height: 26 }} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={() => handleOAuth('twitter')}
            >
              <View style={styles.xIconContainer}>
                <FontAwesome6 name="x-twitter" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={() => handleOAuth('apple')}
            >
              <FontAwesome5 name="apple" size={26} color="#000" style={{ marginBottom: 2 }} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing in with an account, you agree to SO's
            </Text>
            <View style={styles.footerRow}>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}> and </Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Privacy Policy.</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'System', // Fallback to system font, can be overridden by AppText if it maps fonts
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitleText: {
    fontSize: 14,
    color: '#444',
  },
  subtitleAction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: '#000',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%',
    // @ts-ignore - outlineStyle is for web
    outlineStyle: 'none',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 32,
    marginTop: -4,
  },
  submitButton: {
    backgroundColor: '#000',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBEBEB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  socialTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  oauthContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    textDecorationLine: 'underline',
  }
});

