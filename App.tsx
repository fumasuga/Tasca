import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from './src/store/authStore';
import { useTodoStore } from './src/store/todoStore';
import { useThemeStore } from './src/store/themeStore';
import { useLanguageStore } from './src/store/languageStore';
import { AuthScreen } from './src/screens/AuthScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AddTodo } from './src/components/AddTodo';
import { TodoList } from './src/components/TodoList';
import { ContributionGraph } from './src/components/ContributionGraph';
import { CompletedHistory } from './src/components/CompletedHistory';
import { getColors, getShadows, spacing, borderRadius, fontSize } from './src/theme/colors';

type Tab = 'today' | 'history';

function AppContent() {
  const { session, initialized: authInitialized, initialize: initializeAuth, signOut } = useAuthStore();
  const { mode, initialized: themeInitialized, initialize: initializeTheme } = useThemeStore();
  const { initialized: langInitialized, initialize: initializeLang, t } = useLanguageStore();
  const fetchTodos = useTodoStore((s) => s.fetchTodos);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [showSettings, setShowSettings] = useState(false);
  const insets = useSafeAreaInsets();

  const colors = getColors(mode);
  const shadows = getShadows(mode);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  const initialized = authInitialized && themeInitialized && langInitialized;

  useEffect(() => {
    initializeAuth();
    initializeTheme();
    initializeLang();
  }, []);

  useEffect(() => {
    if (initialized) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [initialized]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodos();
    setRefreshing(false);
  };

  // Loading
  if (!initialized) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg.primary }]}>
        <View style={styles.bgGradient}>
          <View style={[styles.bgOrb1, { backgroundColor: colors.accent.glow }]} />
          <View style={[styles.bgOrb2, { backgroundColor: colors.accent.glow }]} />
        </View>
        <LinearGradient
          colors={[colors.accent.primary, colors.accent.secondary]}
          style={[styles.loadingLogo, shadows.glow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.loadingLogoText}>✓</Text>
        </LinearGradient>
        <ActivityIndicator size="small" color={colors.accent.primary} style={{ marginTop: spacing['2xl'] }} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>{t('loading')}</Text>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      </View>
    );
  }

  // Auth
  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg.primary, paddingTop: insets.top }]}>
        <AuthScreen />
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      </View>
    );
  }

  // Settings
  if (showSettings) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg.primary, paddingTop: insets.top }]}>
        <SettingsScreen onClose={() => setShowSettings(false)} />
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      </View>
    );
  }

  // Main
  return (
    <View style={[styles.container, { backgroundColor: colors.bg.primary, paddingTop: insets.top }]}>
      <View style={styles.bgGradient}>
        <View style={[styles.bgOrb1, { backgroundColor: colors.accent.glow }]} />
        <View style={[styles.bgOrb2, { backgroundColor: colors.accent.glow }]} />
      </View>
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.bg.card, borderBottomColor: colors.border.primary }]}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[colors.accent.primary, colors.accent.secondary]}
              style={styles.headerLogo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.headerLogoText}>✓</Text>
            </LinearGradient>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Tasca</Text>
              <Text style={[styles.headerEmail, { color: colors.text.muted }]} numberOfLines={1}>
                {session.user?.email}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: colors.bg.tertiary, borderColor: colors.border.primary }]}
            onPress={() => setShowSettings(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingsIcon, { color: colors.text.secondary }]}>☰</Text>
          </TouchableOpacity>
        </View>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <View style={[styles.tabBar, { backgroundColor: colors.bg.card, borderColor: colors.border.primary }]}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'today' && { backgroundColor: colors.accent.primary }]}
              onPress={() => setActiveTab('today')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, { color: colors.text.muted }, activeTab === 'today' && styles.tabTextActive]}>
                {t('today')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'history' && { backgroundColor: colors.accent.primary }]}
              onPress={() => setActiveTab('history')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, { color: colors.text.muted }, activeTab === 'history' && styles.tabTextActive]}>
                {t('history')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Content */}
        {activeTab === 'today' ? (
          <ScrollView
            style={styles.content}
            contentContainerStyle={[styles.contentContainer, { paddingBottom: spacing['5xl'] + insets.bottom }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent.primary}
                colors={[colors.accent.primary]}
              />
            }
          >
            <AddTodo />
            <ContributionGraph />
            <TodoList />
          </ScrollView>
        ) : (
          <View style={styles.historyWrapper}>
            <CompletedHistory onRefresh={onRefresh} refreshing={refreshing} />
          </View>
        )}
      </Animated.View>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    opacity: 0.5,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 100,
    left: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogoText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: fontSize.sm,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerLogoText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  headerEmail: {
    fontSize: fontSize.xs,
    maxWidth: 180,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  settingsIcon: {
    fontSize: 18,
  },
  tabContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    padding: 4,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.xl,
  },
  historyWrapper: {
    flex: 1,
  },
});
