import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTodoStore } from '../store/todoStore';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { getColors, getShadows, spacing, borderRadius, fontSize } from '../theme/colors';

export const AddTodo: React.FC = () => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const addTodo = useTodoStore((s) => s.addTodo);
  const { mode } = useThemeStore();
  const { t } = useLanguageStore();
  const colors = getColors(mode);
  const shadows = getShadows(mode);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    await addTodo(trimmed);
    setText('');
    Keyboard.dismiss();
  };

  const canSubmit = text.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputWrapper,
        { backgroundColor: colors.bg.card, borderColor: colors.border.primary },
        isFocused && { borderColor: colors.accent.primary, backgroundColor: colors.bg.elevated },
      ]}>
        <TextInput
          style={[styles.input, { color: colors.text.primary }]}
          placeholder={t('whatNeedsToBeDone')}
          placeholderTextColor={colors.text.muted}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={canSubmit ? [colors.accent.primary, colors.accent.secondary] : [colors.bg.tertiary, colors.bg.tertiary]}
            style={[styles.button, canSubmit && shadows.glow]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.buttonIcon, !canSubmit && { color: colors.text.muted }]}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  input: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: fontSize.base,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 30,
  },
});
