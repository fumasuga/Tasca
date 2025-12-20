import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTodoStore } from '../store/todoStore';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { languageLocales } from '../i18n/translations';
import { Todo } from '../types/todo';
import { getColors, spacing, borderRadius, fontSize } from '../theme/colors';

interface GroupedTodos {
  date: string;
  displayDate: string;
  todos: Todo[];
}

interface CompletedHistoryProps {
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
}

const formatDateHeader = (dateStr: string, t: (key: string) => string, language: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return t('today');
  if (isYesterday) return t('yesterday');

  const locale = languageLocales[language as keyof typeof languageLocales] || 'en-US';
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleDateString(locale, options);
};

interface TodoHistoryItemProps {
  item: Todo;
  index: number;
  colors: ReturnType<typeof getColors>;
  t: (key: string) => string;
}

const TodoHistoryItem: React.FC<TodoHistoryItemProps> = ({ item, index, colors, t }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 30,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, []);

  const completedTime = item.completed_at
    ? new Date(item.completed_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    : '';

  const hasOutput = !!item.output && item.output.trim().length > 0;
  const hasUrl = !!item.url && item.url.trim().length > 0;
  const hasDetails = hasOutput || hasUrl;

  const handleOpenUrl = () => {
    if (item.url) {
      Linking.openURL(item.url);
    }
  };

  return (
    <Animated.View style={[
      styles.todoItem,
      { backgroundColor: colors.bg.card, borderColor: colors.border.primary, opacity: fadeAnim }
    ]}>
      <View style={[styles.checkmark, { backgroundColor: colors.success.primary }]}>
        <Text style={styles.checkIcon}>✓</Text>
      </View>
      <TouchableOpacity 
        style={styles.todoContent} 
        onPress={() => hasDetails && setExpanded(!expanded)}
        activeOpacity={hasDetails ? 0.7 : 1}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.todoTitle, { color: colors.text.secondary }]} numberOfLines={expanded ? undefined : 2}>
            {item.title}
          </Text>
          {hasDetails && !expanded && (
            <View style={styles.badgeRow}>
              {hasUrl && (
                <View style={[styles.badge, { backgroundColor: colors.accent.subtle }]}>
                  <Text style={[styles.badgeText, { color: colors.accent.primary }]}>↗</Text>
                </View>
              )}
              {hasOutput && (
                <View style={[styles.badge, { backgroundColor: colors.accent.subtle }]}>
                  <Text style={[styles.outputLabel, { color: colors.accent.primary }]}>{t('output')}</Text>
                </View>
              )}
            </View>
          )}
        </View>
        {expanded && (
          <View style={styles.detailsContainer}>
            {hasUrl && (
              <TouchableOpacity 
                style={[styles.urlContainer, { backgroundColor: colors.bg.tertiary }]}
                onPress={handleOpenUrl}
                activeOpacity={0.7}
              >
                <Text style={[styles.urlLabel, { color: colors.text.muted }]}>{t('link')}</Text>
                <Text style={[styles.urlText, { color: colors.accent.primary }]} numberOfLines={1}>
                  {item.url}
                </Text>
              </TouchableOpacity>
            )}
            {hasOutput && (
              <View style={[styles.outputPreview, { backgroundColor: colors.bg.tertiary }]}>
                <Text style={[styles.outputLabel, { color: colors.text.muted }]}>{t('output')}</Text>
                <Text style={[styles.outputText, { color: colors.text.secondary }]}>{item.output}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.rightColumn}>
        <Text style={[styles.timeText, { color: colors.text.muted }]}>{completedTime}</Text>
        {hasDetails && (
          <Text style={[styles.expandIcon, { color: colors.text.muted }]}>{expanded ? '▲' : '▼'}</Text>
        )}
      </View>
    </Animated.View>
  );
};

interface DateSectionProps {
  group: GroupedTodos;
  colors: ReturnType<typeof getColors>;
  t: (key: string) => string;
  language: string;
}

const DateSection: React.FC<DateSectionProps> = ({ group, colors, t, language }) => {
  return (
    <View style={styles.dateSection}>
      <View style={styles.dateHeader}>
        <Text style={[styles.dateText, { color: colors.text.primary }]}>
          {formatDateHeader(group.date, t, language)}
        </Text>
        <View style={[styles.countBadge, { backgroundColor: colors.accent.subtle }]}>
          <Text style={[styles.countText, { color: colors.accent.primary }]}>{group.todos.length}</Text>
        </View>
      </View>
      {group.todos.map((todo, index) => (
        <TodoHistoryItem key={todo.id} item={todo} index={index} colors={colors} t={t} />
      ))}
    </View>
  );
};

export const CompletedHistory: React.FC<CompletedHistoryProps> = ({ onRefresh, refreshing = false }) => {
  const todos = useTodoStore((s) => s.todos);
  const { mode } = useThemeStore();
  const { t, language } = useLanguageStore();
  const colors = getColors(mode);

  // Group completed todos by date (excluding today)
  const groupedTodos = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedTodos = todos
      .filter(t => t.is_completed && t.completed_at)
      .filter(t => {
        const completedDate = new Date(t.completed_at!);
        completedDate.setHours(0, 0, 0, 0);
        return completedDate < today; // Exclude today's completed todos
      })
      .sort((a, b) =>
        new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
      );

    const groups: Map<string, Todo[]> = new Map();

    completedTodos.forEach(todo => {
      const date = new Date(todo.completed_at!);
      const dateKey = date.toISOString().split('T')[0];

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(todo);
    });

    return Array.from(groups.entries()).map(([date, todos]) => ({
      date,
      displayDate: formatDateHeader(date, t, language),
      todos,
    }));
  }, [todos, t, language]);

  // Stats
  const stats = useMemo(() => {
    const total = groupedTodos.reduce((sum, g) => sum + g.todos.length, 0);
    const withOutput = groupedTodos.reduce(
      (sum, g) => sum + g.todos.filter(t => t.output).length,
      0
    );
    return { total, withOutput };
  }, [groupedTodos]);

  if (groupedTodos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: colors.bg.tertiary }]}>
          <Text style={[styles.emptyIcon, { color: colors.text.muted }]}>✓</Text>
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text.secondary }]}>{t('noHistoryYet')}</Text>
        <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
          {t('completedFromPreviousDays')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={[styles.statsRow, { backgroundColor: colors.bg.tertiary }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.text.muted }]}>{t('completed')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border.primary }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.withOutput}</Text>
          <Text style={[styles.statLabel, { color: colors.text.muted }]}>{t('withOutput')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border.primary }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{groupedTodos.length}</Text>
          <Text style={[styles.statLabel, { color: colors.text.muted }]}>{t('days')}</Text>
        </View>
      </View>
      {/* History List */}
      <FlatList
        data={groupedTodos}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => <DateSection group={item} colors={colors} t={t} language={language} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.primary}
              colors={[colors.accent.primary]}
            />
          ) : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    marginHorizontal: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  dateSection: {
    marginBottom: spacing.xl,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  countText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  checkIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  todoContent: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  todoTitle: {
    fontSize: fontSize.base,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginLeft: spacing.sm,
    gap: 4,
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  detailsContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  urlContainer: {
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  urlLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: 4,
  },
  urlText: {
    fontSize: fontSize.sm,
    textDecorationLine: 'underline',
  },
  outputPreview: {
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  outputLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: 4,
  },
  outputText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  rightColumn: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
    flexShrink: 0,
  },
  timeText: {
    fontSize: fontSize.xs,
  },
  expandIcon: {
    fontSize: 10,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing['3xl'],
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
    textAlign: 'center',
  },
});
