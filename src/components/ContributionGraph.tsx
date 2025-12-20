import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { fetchCompletedTodosForGraph } from '../services/todoService';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { GraphData } from '../types/graph';
import { getColors, spacing, borderRadius, fontSize, ThemeMode } from '../theme/colors';

// GitHub-style color levels
const getGithubColors = (mode: ThemeMode) => ({
  empty: mode === 'dark' ? '#161B22' : '#EBEDF0',
  level1: mode === 'dark' ? '#0E4429' : '#9BE9A8',
  level2: mode === 'dark' ? '#006D32' : '#40C463',
  level3: mode === 'dark' ? '#26A641' : '#30A14E',
  level4: mode === 'dark' ? '#39D353' : '#216E39',
});

const getColorForCount = (count: number, mode: ThemeMode): string => {
  const colors = getGithubColors(mode);
  if (count === 0) return colors.empty;
  if (count <= 1) return colors.level1;
  if (count <= 3) return colors.level2;
  if (count <= 5) return colors.level3;
  return colors.level4;
};

const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const CELL_SIZE = 11;
const CELL_GAP = 3;

export const ContributionGraph: React.FC = () => {
  const [data, setData] = useState<GraphData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mode } = useThemeStore();
  const { t } = useLanguageStore();
  const colors = getColors(mode);
  const githubColors = getGithubColors(mode);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await fetchCompletedTodosForGraph();
        if (mounted) {
          setData(result);
          setError(null);
          Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }).start();
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Build calendar data (last 365 days organized into weeks)
  const { weeks, months, totalCount, longestStreak, currentStreak } = useMemo(() => {
    const today = new Date();
    const dataMap = new Map<string, number>();
    data.forEach(d => dataMap.set(d.date, d.count));

    // Calculate dates for last ~52 weeks
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    // Align to Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const weeks: { date: Date; count: number }[][] = [];
    const monthLabels: { label: string; week: number }[] = [];
    let currentWeek: { date: Date; count: number }[] = [];
    let lastMonth = -1;
    let weekIndex = 0;

    const current = new Date(startDate);
    let total = 0;
    let streak = 0;
    let maxStreak = 0;
    let currentStreakCount = 0;
    let countingCurrentStreak = true;

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const count = dataMap.get(dateStr) || 0;

      // Track streaks (from today backwards)
      if (current <= today) {
        total += count;

        // Check for month change
        if (current.getMonth() !== lastMonth) {
          lastMonth = current.getMonth();
          monthLabels.push({
            label: current.toLocaleDateString('en-US', { month: 'short' }),
            week: weekIndex
          });
        }
      }

      currentWeek.push({ date: new Date(current), count });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
        weekIndex++;
      }

      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Calculate streaks (reverse order from today)
    const allDays = weeks.flat().reverse();
    for (const day of allDays) {
      if (day.date <= today) {
        if (day.count > 0) {
          streak++;
          if (countingCurrentStreak) {
            currentStreakCount++;
          }
        } else {
          maxStreak = Math.max(maxStreak, streak);
          streak = 0;
          countingCurrentStreak = false;
        }
      }
    }
    maxStreak = Math.max(maxStreak, streak);

    return {
      weeks,
      months: monthLabels,
      totalCount: total,
      longestStreak: maxStreak,
      currentStreak: currentStreakCount,
    };
  }, [data]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg.card, borderColor: colors.glass.border }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text.secondary }]}>{t('activity')}</Text>
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={colors.accent.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg.card, borderColor: colors.glass.border }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text.secondary }]}>{t('activity')}</Text>
        </View>
        <Text style={[styles.errorText, { color: colors.error.primary }]}>{error}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.bg.card, borderColor: colors.glass.border, opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.secondary }]}>
          {totalCount} {t('tasksCompletedTheLastYear')}
        </Text>
      </View>
      {/* Graph */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.graphScroll}>
        <View style={styles.graphContainer}>
          {/* Month labels */}
          <View style={styles.monthRow}>
            <View style={styles.dayLabelColumn} />
            {months.map((m, i) => (
              <Text
                key={i}
                style={[
                  styles.monthLabel,
                  { left: m.week * (CELL_SIZE + CELL_GAP) + 24, color: colors.text.muted }
                ]}
              >
                {m.label}
              </Text>
            ))}
          </View>
          {/* Graph grid */}
          <View style={styles.graphRow}>
            {/* Day labels */}
            <View style={styles.dayLabelColumn}>
              {DAYS.map((day, i) => (
                <Text key={i} style={[styles.dayLabel, { color: colors.text.muted }]}>{day}</Text>
              ))}
            </View>
            {/* Cells */}
            <View style={styles.weeksContainer}>
              {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.weekColumn}>
                  {week.map((day, dayIndex) => (
                    <View
                      key={dayIndex}
                      style={[
                        styles.cell,
                        { backgroundColor: getColorForCount(day.count, mode) }
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={[styles.legendText, { color: colors.text.muted }]}>Less</Text>
        {Object.values(githubColors).map((color, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: color }]} />
        ))}
        <Text style={[styles.legendText, { color: colors.text.muted }]}>More</Text>
      </View>
      {/* Stats */}
      <View style={[styles.statsRow, { backgroundColor: colors.bg.tertiary }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{totalCount}</Text>
          <Text style={[styles.statLabel, { color: colors.text.muted }]}>{t('totalCompleted')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border.primary }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{longestStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.text.muted }]}>{t('longestStreak')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border.primary }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{currentStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.text.muted }]}>{t('currentStreak')}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  graphScroll: {
    marginBottom: spacing.md,
  },
  graphContainer: {
    paddingRight: spacing.lg,
  },
  monthRow: {
    flexDirection: 'row',
    height: 16,
    marginBottom: spacing.xs,
    position: 'relative',
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 10,
  },
  graphRow: {
    flexDirection: 'row',
  },
  dayLabelColumn: {
    width: 24,
    marginRight: spacing.xs,
  },
  dayLabel: {
    fontSize: 10,
    height: CELL_SIZE + CELL_GAP,
    lineHeight: CELL_SIZE + CELL_GAP,
  },
  weeksContainer: {
    flexDirection: 'row',
  },
  weekColumn: {
    flexDirection: 'column',
    marginRight: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
    marginBottom: CELL_GAP,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  legendText: {
    fontSize: 10,
  },
  legendCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
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
  loaderContainer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
