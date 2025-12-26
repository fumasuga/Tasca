import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { getColors, getShadows, spacing, borderRadius, fontSize } from '../theme/colors';
import { validateEmail, validatePassword, validatePasswordConfirm } from '../utils/validation';

// Default colors for static styles (dark mode)
const colors = getColors('dark');
const shadows = getShadows('dark');

export const AuthScreen: React.FC = () => {
  const { mode } = useThemeStore();
  const { t } = useLanguageStore();
  const themeColors = getColors(mode);
  const themeShadows = getShadows(mode);
  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  // Sign Up Modal state
  const [signUpVisible, setSignUpVisible] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpFocused, setSignUpFocused] = useState<string | null>(null);
  
  // Success state
  const [successEmail, setSuccessEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [signUpEmailError, setSignUpEmailError] = useState('');
  const [signUpPasswordError, setSignUpPasswordError] = useState('');
  const [signUpConfirmError, setSignUpConfirmError] = useState('');
  
  const setSession = useAuthStore((s) => s.setSession);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  const canSignIn = email.trim().length > 0 && password.length >= 6 && !loading;
  const canSignUp = signUpEmail.trim().length > 0 && signUpPassword.length >= 6 && signUpPassword === signUpConfirm && !signUpLoading;

  const handleSignIn = async () => {
    // バリデーション
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    setEmailError(emailValidation.error || '');
    setPasswordError(passwordValidation.error || '');
    
    if (!emailValidation.isValid || !passwordValidation.isValid) {
      return;
    }
    
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (data.session) setSession(data.session);
    } catch (error: any) {
      const message = error?.message ?? 'Invalid email or password';
      Alert.alert('Login Failed', message + '\n\nPlease check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    // バリデーション
    const emailValidation = validateEmail(signUpEmail);
    const passwordValidation = validatePassword(signUpPassword);
    const confirmValidation = validatePasswordConfirm(signUpPassword, signUpConfirm);
    
    setSignUpEmailError(emailValidation.error || '');
    setSignUpPasswordError(passwordValidation.error || '');
    setSignUpConfirmError(confirmValidation.error || '');
    
    if (!emailValidation.isValid || !passwordValidation.isValid || !confirmValidation.isValid) {
      return;
    }
    
    setSignUpLoading(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail.trim(),
        password: signUpPassword,
      });
      if (error) throw error;
      if (data.session) {
        setSession(data.session);
        setSignUpVisible(false);
      } else if (data.user) {
        setSuccessEmail(signUpEmail.trim());
        setSignUpVisible(false);
        setShowSuccess(true);
      }
    } catch (error: any) {
      const message = error?.message ?? 'Failed to create account';
      let hint = '';
      if (message.toLowerCase().includes('invalid') && message.toLowerCase().includes('email')) {
        hint = '\n\nPlease use a real email address. Test domains like @example.com are not allowed.';
      }
      Alert.alert('Signup Failed', message + hint);
    } finally {
      setSignUpLoading(false);
    }
  };

  const openSignUp = () => {
    setSignUpEmail('');
    setSignUpPassword('');
    setSignUpConfirm('');
    setSignUpEmailError('');
    setSignUpPasswordError('');
    setSignUpConfirmError('');
    setSignUpVisible(true);
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    setEmail(successEmail);
    setPassword('');
  };

  if (!isSupabaseConfigured()) {
    return (
      <View style={styles.container}>
        <View style={styles.configCard}>
          <Text style={styles.configIcon}>⚙️</Text>
          <Text style={styles.configTitle}>Setup Required</Text>
          <Text style={styles.configText}>
            Configure environment variables
          </Text>
        </View>
      </View>
    );
  }

  // Success Modal
  if (showSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.bgGradient}>
          <View style={styles.bgOrb1} />
          <View style={styles.bgOrb2} />
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successCard}>
          <LinearGradient
            colors={[colors.success.primary, '#059669']}
            style={styles.successIconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.successIcon}>✓</Text>
          </LinearGradient>
          <Text style={styles.successTitle}>{t('accountCreated')}</Text>
          <Text style={styles.successMessage}>
            {t('confirmEmailSent')}
          </Text>
          <View style={styles.emailBadge}>
            <Text style={styles.emailBadgeText}>{successEmail}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {t('checkInbox')}
            </Text>
          </View>
          <TouchableOpacity style={styles.successButton} onPress={closeSuccess} activeOpacity={0.8}>
            <LinearGradient
              colors={[colors.accent.primary, colors.accent.secondary]}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>{t('continueToSignIn')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.bgGradient}>
        <View style={styles.bgOrb1} />
        <View style={styles.bgOrb2} />
      </View>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.accent.primary, colors.accent.secondary]}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoIcon}>✓</Text>
          </LinearGradient>
          <View style={styles.headerTextContainer}>
            <Text style={styles.appName}>Tasca</Text>
            <Text style={styles.tagline}>{t('welcomeBack')}</Text>
          </View>
        </View>

        {/* Sign In Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('signIn')}</Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('email')}</Text>
              <View style={[styles.inputContainer, focusedInput === 'email' && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.text.muted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  autoCorrect={false}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('password')}</Text>
              <View style={[styles.inputContainer, focusedInput === 'password' && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>
            {loading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="small" color={colors.accent.primary} />
                <Text style={styles.loaderText}>{t('signingIn')}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.submitButton, !canSignIn && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={!canSignIn}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={canSignIn ? [colors.accent.primary, colors.accent.secondary] : [colors.bg.elevated, colors.bg.elevated]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.buttonText, !canSignIn && styles.buttonTextDisabled]}>{t('signIn')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('noAccount')}{' '}
            <Text style={styles.footerLink} onPress={openSignUp}>{t('signUp')}</Text>
          </Text>
        </View>
      </Animated.View>
      {/* Sign Up Modal */}
      <Modal
        visible={signUpVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setSignUpVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView 
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalCard}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('createAccount')}</Text>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setSignUpVisible(false)}
                >
                  <Text style={styles.closeIcon}>×</Text>
                </TouchableOpacity>
              </View>
              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('email')}</Text>
                  <View style={[styles.inputContainer, signUpFocused === 'email' && styles.inputFocused]}>
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.text.muted}
                      value={signUpEmail}
                      onChangeText={setSignUpEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!signUpLoading}
                      autoCorrect={false}
                      onFocus={() => setSignUpFocused('email')}
                      onBlur={() => setSignUpFocused(null)}
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('password')}</Text>
                  <View style={[styles.inputContainer, signUpFocused === 'password' && styles.inputFocused]}>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={colors.text.muted}
                      value={signUpPassword}
                      onChangeText={setSignUpPassword}
                      secureTextEntry
                      editable={!signUpLoading}
                      onFocus={() => setSignUpFocused('password')}
                      onBlur={() => setSignUpFocused(null)}
                    />
                  </View>
                  <Text style={styles.hint}>{t('minPassword')}</Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('confirmPassword')}</Text>
                  <View style={[
                    styles.inputContainer,
                    signUpFocused === 'confirm' && styles.inputFocused,
                    signUpPassword && signUpConfirm && signUpPassword !== signUpConfirm && styles.inputError,
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={colors.text.muted}
                      value={signUpConfirm}
                      onChangeText={setSignUpConfirm}
                      secureTextEntry
                      editable={!signUpLoading}
                      onFocus={() => setSignUpFocused('confirm')}
                      onBlur={() => setSignUpFocused(null)}
                    />
                  </View>
                  {signUpPassword && signUpConfirm && (
                    <Text style={[
                      styles.hint,
                      signUpPassword === signUpConfirm ? styles.hintSuccess : styles.hintError
                    ]}>
                      {signUpPassword === signUpConfirm ? t('passwordsMatch') : t('passwordsNoMatch')}
                    </Text>
                  )}
                </View>
                {signUpLoading ? (
                  <View style={styles.loader}>
                    <ActivityIndicator size="small" color={colors.accent.primary} />
                    <Text style={styles.loaderText}>{t('creatingAccount')}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.submitButton, !canSignUp && styles.buttonDisabled]}
                    onPress={handleSignUp}
                    disabled={!canSignUp}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={canSignUp ? [colors.accent.primary, colors.accent.secondary] : [colors.bg.elevated, colors.bg.elevated]}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={[styles.buttonText, !canSignUp && styles.buttonTextDisabled]}>{t('createAccount')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.accent.glow,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: -50,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.accent.glow,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    paddingBottom: spacing['6xl'],
  },
  
  // Config
  configCard: {
    backgroundColor: colors.bg.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.primary,
    padding: spacing['3xl'],
    alignItems: 'center',
    marginHorizontal: spacing.xl,
  },
  configIcon: { fontSize: 48, marginBottom: spacing.lg },
  configTitle: { fontSize: fontSize.xl, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.sm },
  configText: { fontSize: fontSize.sm, color: colors.text.secondary, textAlign: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoGradient: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
    ...shadows.glow,
  },
  headerTextContainer: {
    flex: 1,
  },
  logoIcon: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
  },
  appName: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // Card
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.xl,
    ...shadows.lg,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },

  // Form
  form: {},
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  inputContainer: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.primary,
  },
  inputFocused: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.bg.elevated,
  },
  inputError: {
    borderColor: colors.error.primary,
  },
  input: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  hintSuccess: {
    color: colors.success.primary,
  },
  hintError: {
    color: colors.error.primary,
  },

  // Button
  submitButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.glow,
  },
  gradientButton: {
    paddingVertical: spacing.lg + 2,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  buttonDisabled: {
    ...shadows.sm,
  },
  buttonTextDisabled: {
    color: colors.text.muted,
  },

  // Loader
  loader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  loaderText: {
    marginLeft: spacing.md,
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['2xl'],
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
  footerLink: {
    fontSize: fontSize.sm,
    color: colors.accent.primary,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.bg.primary,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 22,
    color: colors.text.secondary,
    lineHeight: 24,
  },

  // Success
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  successCard: {
    backgroundColor: colors.bg.card,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing['3xl'],
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.lg,
  },
  successIconGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    ...shadows.successGlow,
  },
  successIcon: {
    fontSize: 44,
    color: '#fff',
  },
  successTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  successMessage: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  emailBadge: {
    backgroundColor: colors.accent.subtle,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
  },
  emailBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.accent.tertiary,
  },
  infoCard: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
    width: '100%',
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  successButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.glow,
  },
});
