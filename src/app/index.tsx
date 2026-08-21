import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Colors, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const { balance, transactions, savingsGoals } = useFinanceData();
  const theme = useTheme();
  const scheme = useColorScheme() ?? 'dark';
  const isDark = scheme === 'dark';

  const quickActions = [
    { title: 'Send', icon: 'send' as const, color: '#818CF8', bg: '#818CF820', route: '/transfer' },
    { title: 'Invest', icon: 'trending-up' as const, color: '#22C55E', bg: '#22C55E20', route: '/investments' },
    { title: 'Budget', icon: 'pie-chart' as const, color: '#F59E0B', bg: '#F59E0B20', route: '/budgets' },
    { title: 'Save', icon: 'heart' as const, color: '#EF4444', bg: '#EF444420', route: '/savings' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.greetingLabel}>Good morning,</ThemedText>
              <ThemedText style={styles.greetingName}>Alex Morgan</ThemedText>
            </View>
            <Pressable onPress={() => router.push('/profile' as any)} style={[styles.avatarBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Ionicons name="person-circle" size={36} color={theme.accent} />
            </Pressable>
          </View>

          {/* ── Balance Card ── */}
          <LinearGradient
            colors={isDark ? ['#1E1F3A', '#2D1B69', '#1A1040'] : ['#4338CA', '#6366F1', '#818CF8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}>
            {/* Decorative circles */}
            <View style={[styles.decorCircle, styles.decorCircle1]} />
            <View style={[styles.decorCircle, styles.decorCircle2]} />

            <ThemedText style={styles.balanceLabel}>TOTAL BALANCE</ThemedText>
            <ThemedText style={styles.balanceAmount}>
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </ThemedText>
            <View style={styles.balanceFooter}>
              <View style={styles.gainPill}>
                <Ionicons name="arrow-up" size={12} color="#22C55E" />
                <ThemedText style={styles.gainText}>+8.4% this month</ThemedText>
              </View>
              <ThemedText style={styles.balanceSubLabel}>Active Account</ThemedText>
            </View>
          </LinearGradient>

          {/* ── Quick Actions ── */}
          <View style={styles.actionsRow}>
            {quickActions.map((a) => (
              <Pressable
                key={a.title}
                onPress={() => router.push(a.route as any)}
                style={({ pressed }) => [
                  styles.actionCard,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }
                ]}>
                <View style={[styles.actionIconWrap, { backgroundColor: a.bg }]}>
                  <Ionicons name={a.icon} size={20} color={a.color} />
                </View>
                <ThemedText style={[styles.actionLabel, { color: theme.textSecondary }]}>{a.title}</ThemedText>
              </Pressable>
            ))}
          </View>

          {/* ── Savings Goals ── */}
          <View style={styles.sectionRow}>
            <ThemedText style={styles.sectionTitle}>Savings Goals</ThemedText>
            <Pressable onPress={() => router.push('/savings' as any)}>
              <ThemedText style={[styles.seeAll, { color: theme.accent }]}>See All</ThemedText>
            </Pressable>
          </View>

          <View style={styles.goalsContainer}>
            {savingsGoals.slice(0, 2).map((goal) => {
              const pct = Math.min(1, goal.current / goal.target);
              return (
                <ThemedView key={goal.id} type="backgroundElement" style={[styles.goalCard, { borderColor: theme.border }]}>
                  <View style={styles.goalTop}>
                    <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
                    <ThemedText style={[styles.goalPct, { color: theme.accent }]}>{(pct * 100).toFixed(0)}%</ThemedText>
                  </View>
                  <View style={styles.goalAmounts}>
                    <ThemedText style={[styles.goalCurrent, { color: Colors[scheme].success }]}>${goal.current.toLocaleString()}</ThemedText>
                    <ThemedText style={[styles.goalTarget, { color: theme.textSecondary }]}>of ${goal.target.toLocaleString()}</ThemedText>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
                    <LinearGradient
                      colors={['#6366F1', '#818CF8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${pct * 100}%` }]}
                    />
                  </View>
                </ThemedView>
              );
            })}
          </View>

          {/* ── Recent Transactions ── */}
          <View style={styles.sectionRow}>
            <ThemedText style={styles.sectionTitle}>Recent Transactions</ThemedText>
            <Pressable onPress={() => router.push('/analytics' as any)}>
              <ThemedText style={[styles.seeAll, { color: theme.accent }]}>Analytics</ThemedText>
            </Pressable>
          </View>

          <View style={styles.txList}>
            {transactions.slice(0, 5).map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <ThemedView key={tx.id} type="backgroundElement" style={[styles.txCard, { borderColor: theme.border }]}>
                  <View style={[styles.txIconWrap, { backgroundColor: isIncome ? '#22C55E20' : '#EF444420' }]}>
                    <Ionicons
                      name={isIncome ? 'arrow-down' : 'arrow-up'}
                      size={16}
                      color={isIncome ? '#22C55E' : '#EF4444'}
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <ThemedText style={styles.txTitle}>{tx.title}</ThemedText>
                    <ThemedText style={[styles.txMeta, { color: theme.textSecondary }]}>{tx.category} · {tx.date}</ThemedText>
                  </View>
                  <ThemedText style={[styles.txAmount, { color: isIncome ? '#22C55E' : theme.text }]}>
                    {isIncome ? '+' : '-'}${tx.amount.toFixed(2)}
                  </ThemedText>
                </ThemedView>
              );
            })}
          </View>

          <View style={{ height: BottomTabInset + Spacing.five }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { alignItems: 'center' },
  innerContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  greetingLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  avatarBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  // Balance Card
  balanceCard: {
    borderRadius: 24,
    padding: Spacing.four,
    overflow: 'hidden',
    minHeight: 170,
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decorCircle1: {
    width: 180,
    height: 180,
    top: -60,
    right: -40,
  },
  decorCircle2: {
    width: 120,
    height: 120,
    top: -20,
    right: 100,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: 'rgba(255,255,255,0.65)',
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    color: '#FFFFFF',
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  gainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  gainText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#22C55E',
  },
  balanceSubLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },

  // Quick Actions
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.one,
    borderRadius: Radii.lg,
    borderWidth: 1,
    gap: Spacing.two,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Section headers
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Goals
  goalsContainer: { gap: Spacing.two },
  goalCard: {
    padding: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
    gap: Spacing.two,
  },
  goalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  goalPct: {
    fontSize: 14,
    fontWeight: '800',
  },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  goalCurrent: {
    fontSize: 15,
    fontWeight: '700',
  },
  goalTarget: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 6,
  },

  // Transactions
  txList: { gap: Spacing.two },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: Spacing.three,
  },
  txIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: { flex: 1 },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  txMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
});
