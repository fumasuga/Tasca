import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { Language, languageNames } from '../i18n/translations';
import { getColors, getShadows, spacing, borderRadius, fontSize, ThemeMode } from '../theme/colors';

interface SettingsScreenProps {
  onClose: () => void;
}

const languages: Language[] = ['en', 'ja', 'fr', 'ko'];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const { mode, toggle } = useThemeStore();
  const { session, signOut, deleteUser } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();
  const colors = getColors(mode);
  const shadows = getShadows(mode);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('deleteAccount'),
      `${t('deleteAccountConfirm')}\n\n${t('deleteAccountWarning')}`,
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('deleteAccount'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteUser(t);
              Alert.alert(t('deleteAccountSuccess'), '', [
                {
                  text: 'OK',
                  onPress: () => {
                    onClose();
                  },
                },
              ]);
            } catch (error) {
              // エラーは既にdeleteUser内でAlert表示されている
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bg.card, borderBottomColor: colors.border.primary }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton} activeOpacity={0.7}>
          <Text style={[styles.backIcon, { color: colors.text.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t('settings')}</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>{t('account').toUpperCase()}</Text>
          <View style={[styles.card, { backgroundColor: colors.bg.card, borderColor: colors.border.primary }, shadows.sm]}>
            <View style={styles.accountRow}>
              <LinearGradient
                colors={[colors.accent.primary, colors.accent.secondary]}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>
                  {session?.user?.email?.charAt(0).toUpperCase() || '?'}
                </Text>
              </LinearGradient>
              <View style={styles.accountInfo}>
                <Text style={[styles.emailText, { color: colors.text.primary }]} numberOfLines={1}>
                  {session?.user?.email}
                </Text>
                <Text style={[styles.memberSince, { color: colors.text.muted }]}>
                  Member since {new Date(session?.user?.created_at || '').toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>{t('theme')}</Text>
          <View style={[styles.card, { backgroundColor: colors.bg.card, borderColor: colors.border.primary }, shadows.sm]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, { color: colors.text.muted }]}>
                  {mode === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
                </Text>
              </View>
              <Switch
                value={mode === 'dark'}
                onValueChange={toggle}
                trackColor={{ false: colors.border.primary, true: colors.accent.primary }}
                thumbColor={mode === 'dark' ? '#fff' : '#fff'}
                ios_backgroundColor={colors.border.primary}
              />
            </View>
          </View>
        </View>
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>{t('language').toUpperCase()}</Text>
          <View style={[styles.card, { backgroundColor: colors.bg.card, borderColor: colors.border.primary }, shadows.sm]}>
            {languages.map((lang, index) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageRow,
                  index < languages.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border.primary },
                ]}
                onPress={() => setLanguage(lang)}
                activeOpacity={0.7}
              >
                <Text style={[styles.languageText, { color: colors.text.primary }]}>
                  {languageNames[lang]}
                </Text>
                {language === lang && (
                  <Text style={[styles.checkMark, { color: colors.accent.primary }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Theme Preview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>PREVIEW</Text>
          <View style={[styles.previewCard, { backgroundColor: colors.bg.card, borderColor: colors.border.primary }, shadows.sm]}>
            <View style={styles.previewRow}>
              <View style={[styles.previewSwatch, { backgroundColor: colors.bg.primary }]}>
                <Text style={[styles.previewLabel, { color: colors.text.primary }]}>Bg</Text>
              </View>
              <View style={[styles.previewSwatch, { backgroundColor: colors.accent.primary }]}>
                <Text style={styles.previewLabelLight}>Accent</Text>
              </View>
              <View style={[styles.previewSwatch, { backgroundColor: colors.success.primary }]}>
                <Text style={styles.previewLabelLight}>Success</Text>
              </View>
              <View style={[styles.previewSwatch, { backgroundColor: colors.error.primary }]}>
                <Text style={styles.previewLabelLight}>Error</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: colors.error.subtle, borderColor: colors.error.primary }]}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Text style={[styles.signOutText, { color: colors.error.primary }]}>{t('signOut')}</Text>
          </TouchableOpacity>
        </View>
        {/* Delete Account */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.deleteButton,
              { backgroundColor: colors.error.subtle, borderColor: colors.error.primary },
              isDeleting && styles.deleteButtonDisabled,
            ]}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.error.primary} />
            ) : (
              <Text style={[styles.deleteText, { color: colors.error.primary }]}>{t('deleteAccount')}</Text>
            )}
          </TouchableOpacity>
        </View>
        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.text.muted }]}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  backIcon: {
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#fff',
  },
  accountInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  emailText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  memberSince: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  previewCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  previewRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  previewSwatch: {
    flex: 1,
    height: 60,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  previewLabelLight: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#fff',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  languageText: {
    fontSize: fontSize.base,
    fontWeight: '500',
  },
  checkMark: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  signOutButton: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  signOutText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  deleteButton: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  versionText: {
    fontSize: fontSize.xs,
  },
});

