import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TextInput,
  Keyboard,
  Platform,
  Linking,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTodoStore } from '../store/todoStore';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { Todo } from '../types/todo';
import { getColors, spacing, borderRadius, fontSize, ThemeMode } from '../theme/colors';

interface TodoItemProps {
  item: Todo;
  index: number;
  onToggle: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onUpdateOutput: (id: string, output: string) => void;
  onUpdateUrl: (id: string, url: string) => void;
  colors: ReturnType<typeof getColors>;
  t: (key: string) => string;
}

const TodoItem: React.FC<TodoItemProps> = ({ 
  item, index, onToggle, onDelete, onUpdateOutput, onUpdateUrl, colors, t 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [expanded, setExpanded] = useState(false);
  const [outputText, setOutputText] = useState(item.output || '');
  const [urlText, setUrlText] = useState(item.url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  
  // Modal states
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [modalOutputText, setModalOutputText] = useState('');
  const [modalUrlText, setModalUrlText] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  useEffect(() => {
    setOutputText(item.output || '');
  }, [item.output]);

  useEffect(() => {
    setUrlText(item.url || '');
  }, [item.url]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return `${diffMins}${t('minutesAgo')}`;
    if (diffHours < 24) return `${diffHours}${t('hoursAgo')}`;
    if (diffDays === 1) return t('yesterday');
    if (diffDays < 7) return `${diffDays}${t('daysAgo')}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const openOutputModal = () => {
    setModalOutputText(item.output || '');
    setShowOutputModal(true);
  };

  const openUrlModal = () => {
    setModalUrlText(item.url || '');
    setShowUrlModal(true);
  };

  const handleSaveOutput = async () => {
    if (modalOutputText === (item.output || '')) {
      setShowOutputModal(false);
      return;
    }
    setIsSaving(true);
    await onUpdateOutput(item.id, modalOutputText);
    setIsSaving(false);
    setOutputText(modalOutputText);
    setShowOutputModal(false);
    Keyboard.dismiss();
  };

  const handleSaveUrl = async () => {
    if (modalUrlText === (item.url || '')) {
      setShowUrlModal(false);
      return;
    }
    setIsSavingUrl(true);
    await onUpdateUrl(item.id, modalUrlText);
    setIsSavingUrl(false);
    setUrlText(modalUrlText);
    setShowUrlModal(false);
    Keyboard.dismiss();
  };

  const hasOutput = !!item.output && item.output.trim().length > 0;
  const hasUrl = !!item.url && item.url.trim().length > 0;

  return (
    <Animated.View style={[
      styles.itemContainer,
      { backgroundColor: colors.bg.card, borderColor: colors.glass.border },
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
    ]}>
      {/* Main Row */}
      <View style={styles.item}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => onToggle(item.id, item.is_completed)}
        >
          {item.is_completed ? (
            <LinearGradient
              colors={[colors.success.primary, colors.success.secondary]}
              style={styles.checkboxCompleted}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.checkmark}>✓</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.checkbox, { borderColor: colors.border.secondary, backgroundColor: colors.bg.tertiary }]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.content}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <Text style={[styles.title, { color: colors.text.primary }, item.is_completed && { textDecorationLine: 'line-through', color: colors.text.muted }]} numberOfLines={expanded ? undefined : 2}>
            {item.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.dateText, { color: colors.text.muted }]}>
              {item.is_completed && item.completed_at
                ? `${t('completedAgo')} ${formatDate(item.completed_at)}`
                : `${t('createdAgo')} ${formatDate(item.created_at)}`}
            </Text>
            {hasUrl && !expanded && (
              <TouchableOpacity style={[styles.linkBadge, { backgroundColor: colors.accent.subtle }]} onPress={() => Linking.openURL(item.url!)}>
                <Text style={[styles.linkBadgeText, { color: colors.accent.primary }]}>↗</Text>
              </TouchableOpacity>
            )}
            {hasOutput && !expanded && (
              <View style={[styles.outputBadge, { backgroundColor: colors.accent.subtle }]}>
                <Text style={[styles.outputBadgeText, { color: colors.accent.primary }]}>{t('output').toLowerCase()}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.expandButton, { backgroundColor: colors.bg.tertiary }]}
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={[styles.expandIcon, { color: colors.text.muted }]}>{expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.error.subtle }]}
            onPress={() => onDelete(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.deleteIcon, { color: colors.error.primary }]}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Expanded Sections */}
      {expanded && (
        <View style={[styles.expandedContent, { borderTopColor: colors.border.primary, backgroundColor: colors.bg.tertiary }]}>
          {/* Link Section */}
          <View style={styles.linkSection}>
            <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>{t('link')}</Text>
            {hasUrl ? (
              <View style={styles.linkDisplayRow}>
                <TouchableOpacity 
                  style={[styles.urlDisplayContainer, { backgroundColor: colors.bg.primary, borderColor: colors.border.primary }]} 
                  onPress={() => Linking.openURL(item.url!)} 
                  activeOpacity={0.7}
                >
                  <Text style={[styles.urlDisplayText, { color: colors.accent.primary }]} numberOfLines={1}>{item.url}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={openUrlModal} 
                  style={[styles.editButton, { backgroundColor: colors.bg.elevated }]}
                >
                  <Text style={[styles.editButtonText, { color: colors.text.secondary }]}>{t('edit')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: colors.bg.primary, borderColor: colors.border.primary }]}
                onPress={openUrlModal}
                activeOpacity={0.7}
              >
                <Text style={[styles.addButtonText, { color: colors.text.muted }]}>{t('addUrl')}</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* Output Section */}
          <View style={styles.outputSection}>
            <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>{t('output')}</Text>
            {hasOutput ? (
              <TouchableOpacity 
                style={[styles.outputPreview, { backgroundColor: colors.bg.primary, borderColor: colors.border.primary }]}
                onPress={openOutputModal}
                activeOpacity={0.7}
              >
                <Text style={[styles.outputPreviewText, { color: colors.text.primary }]} numberOfLines={3}>
                  {item.output}
                </Text>
                <Text style={[styles.tapToEdit, { color: colors.text.muted }]}>{t('tapToEdit')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: colors.bg.primary, borderColor: colors.border.primary }]}
                onPress={openOutputModal}
                activeOpacity={0.7}
              >
                <Text style={[styles.addButtonText, { color: colors.text.muted }]}>{t('addOutput')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Output Modal */}
      <Modal
        visible={showOutputModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowOutputModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView 
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.modalCard, { backgroundColor: colors.bg.primary }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text.primary }]}>{t('output')}</Text>
                <TouchableOpacity 
                  style={[styles.closeButton, { backgroundColor: colors.bg.tertiary }]} 
                  onPress={() => setShowOutputModal(false)}
                >
                  <Text style={[styles.closeIcon, { color: colors.text.secondary }]}>×</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.modalSubtitle, { color: colors.text.muted }]} numberOfLines={2}>
                {item.title}
              </Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.bg.tertiary, borderColor: colors.border.primary, color: colors.text.primary }]}
                placeholder={t('outputPlaceholder')}
                placeholderTextColor={colors.text.muted}
                value={modalOutputText}
                onChangeText={setModalOutputText}
                multiline
                textAlignVertical="top"
                autoFocus
              />
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalCancelButton, { backgroundColor: colors.bg.tertiary }]}
                  onPress={() => setShowOutputModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalCancelText, { color: colors.text.secondary }]}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalSaveButton, { backgroundColor: colors.accent.primary }]}
                  onPress={handleSaveOutput}
                  activeOpacity={0.8}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveText}>{t('save')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* URL Modal */}
      <Modal
        visible={showUrlModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowUrlModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView 
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.modalCard, { backgroundColor: colors.bg.primary }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text.primary }]}>{t('link')}</Text>
                <TouchableOpacity 
                  style={[styles.closeButton, { backgroundColor: colors.bg.tertiary }]} 
                  onPress={() => setShowUrlModal(false)}
                >
                  <Text style={[styles.closeIcon, { color: colors.text.secondary }]}>×</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.modalSubtitle, { color: colors.text.muted }]} numberOfLines={2}>
                {item.title}
              </Text>
              <TextInput
                style={[styles.modalUrlInput, { backgroundColor: colors.bg.tertiary, borderColor: colors.border.primary, color: colors.text.primary }]}
                placeholder="https://..."
                placeholderTextColor={colors.text.muted}
                value={modalUrlText}
                onChangeText={setModalUrlText}
                autoCapitalize="none"
                keyboardType="url"
                autoFocus
              />
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalCancelButton, { backgroundColor: colors.bg.tertiary }]}
                  onPress={() => setShowUrlModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalCancelText, { color: colors.text.secondary }]}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalSaveButton, { backgroundColor: colors.accent.primary }]}
                  onPress={handleSaveUrl}
                  activeOpacity={0.8}
                  disabled={isSavingUrl}
                >
                  {isSavingUrl ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveText}>{t('save')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Animated.View>
  );
};

export const TodoList: React.FC = () => {
  const { todos, loading, fetchTodos, toggleTodo, deleteTodo, updateOutput, updateUrl } = useTodoStore();
  const { mode } = useThemeStore();
  const { t } = useLanguageStore();
  const colors = getColors(mode);

  useEffect(() => {
    fetchTodos();
  }, []);

  // Filter: Show uncompleted todos + today's completed todos
  const todaysTodos = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return todos.filter(t => {
      if (!t.is_completed) return true;
      if (!t.completed_at) return true;

      const completedDate = new Date(t.completed_at);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });
  }, [todos]);

  if (loading && todos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.accent.primary} />
        <Text style={[styles.loadingText, { color: colors.text.muted }]}>{t('loadingTasks')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={todaysTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TodoItem
            item={item}
            index={index}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onUpdateOutput={updateOutput}
            onUpdateUrl={updateUrl}
            colors={colors}
            t={t}
          />
        )}
        contentContainerStyle={styles.list}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.bg.tertiary }]}>
              <Text style={[styles.emptyIcon, { color: colors.text.muted }]}>✓</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.secondary }]}>{t('allCaughtUp')}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>{t('addNewTask')}</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    paddingVertical: spacing['4xl'],
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  itemContainer: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  checkboxContainer: {
    marginRight: spacing.md,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
  },
  checkboxCompleted: {
    width: 26,
    height: 26,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: fontSize.xs,
  },
  linkBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  linkBadgeText: {
    fontSize: 10,
  },
  outputBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  outputBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  expandButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIcon: {
    fontSize: 10,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 18,
    fontWeight: '300',
    lineHeight: 20,
  },
  expandedContent: {
    borderTopWidth: 1,
    padding: spacing.lg,
  },
  linkSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  linkDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  urlDisplayContainer: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  urlDisplayText: {
    fontSize: fontSize.sm,
    textDecorationLine: 'underline',
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  editButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  addButton: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: fontSize.sm,
  },
  outputSection: {},
  outputPreview: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  outputPreviewText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  tapToEdit: {
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  // Modal styles
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
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 22,
    lineHeight: 24,
  },
  modalSubtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  modalInput: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    fontSize: fontSize.base,
    minHeight: 150,
    maxHeight: 300,
  },
  modalUrlInput: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    fontSize: fontSize.base,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalCancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  modalCancelText: {
    fontSize: fontSize.base,
    fontWeight: '500',
  },
  modalSaveButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
  },
});
