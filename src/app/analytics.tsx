import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useTheme } from '@/hooks/use-theme';

const CHART_HEIGHT = 160;

export default function AnalyticsScreen() {
  const { transactions } = useFinanceData();
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = useState('August');

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals: Record<string, number> = {};

  transactions.forEach((tx) => {
    if (tx.type === 'income') { totalIncome += tx.amount; }
    else { totalExpense += tx.amount; categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount; }
  });

  const catColors: Record<string, string> = {
    Food: '#F59E0B', Shopping: '#EF4444', Entertainment: '#818CF8', Savings: '#22C55E', Transport: '#06B6D4', Other: '#6366F1',
  };

  const categories = Object.keys(categoryTotals)
    .map((cat) => ({ name: cat, amount: categoryTotals[cat], pct: totalExpense > 0 ? (categoryTotals[cat] / totalExpense) * 100 : 0, color: catColors[cat] ?? '#6366F1' }))
    .sort((a, b) => b.amount - a.amount);

  const monthlyData = [
    { month: 'Apr', amount: 1200 },
    { month: 'May', amount: 1900 },
    { month: 'Jun', amount: 1500 },
    { month: 'Jul', amount: 2400 },
    { month: 'Aug', amount: totalExpense },
  ];
  const maxAmt = Math.max(...monthlyData.map((d) => d.amount), 1);

  const savings = totalIncome - totalExpense;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.headerSub}>Overview</ThemedText>
              <ThemedText style={styles.headerTitle}>Spending Analytics</ThemedText>
            </View>
            <Pressable style={[styles.monthPill, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <ThemedText style={[styles.monthText, { color: theme.text }]}>{selectedMonth} 2026</ThemedText>
              <Ionicons name="chevron-down" size={12} color={theme.textSecondary} />
            </Pressable>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            {[
              { label: 'Income', value: totalIncome, color: '#22C55E', icon: 'arrow-down' as const },
              { label: 'Expenses', value: totalExpense, color: '#EF4444', icon: 'arrow-up' as const },
              { label: 'Net Saved', value: savings, color: '#818CF8', icon: 'trending-up' as const },
            ].map((item) => (
              <ThemedView key={item.label} type="backgroundElement" style={[styles.summaryCard, { borderColor: theme.border }]}>
                <View style={[styles.summaryIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={14} color={item.color} />
                </View>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>{item.label}</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: item.value < 0 ? '#EF4444' : item.color }]}>
                  {item.value < 0 ? '-' : ''}${Math.abs(item.value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </ThemedText>
              </ThemedView>
            ))}
          </View>

          {/* Bar Chart */}
          <ThemedView type="backgroundElement" style={[styles.chartCard, { borderColor: theme.border }]}>
            <ThemedText style={styles.chartTitle}>Monthly Spending Trend</ThemedText>
            <View style={styles.barChart}>
              {monthlyData.map((d, i) => {
                const isSelected = d.month === 'Aug';
                const h = Math.max(8, (d.amount / maxAmt) * CHART_HEIGHT);
                return (
                  <View key={i} style={styles.barCol}>
                    <ThemedText style={[styles.barValue, { color: isSelected ? theme.accent : theme.textSecondary }]}>
                      ${Math.round(d.amount / 100) * 100 > 999 ? (d.amount / 1000).toFixed(1) + 'k' : Math.round(d.amount)}
                    </ThemedText>
                    <View style={[styles.barTrack, { height: CHART_HEIGHT }]}>
                      {isSelected ? (
                        <LinearGradient
                          colors={['#6366F1', '#818CF8']}
                          style={[styles.barFill, { height: h }]}
                          start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
                        />
                      ) : (
                        <View style={[styles.barFill, { height: h, backgroundColor: theme.backgroundSelected }]} />
                      )}
                    </View>
                    <ThemedText style={[styles.barLabel, { color: isSelected ? theme.accent : theme.textSecondary, fontWeight: isSelected ? '700' : '500' }]}>
                      {d.month}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </ThemedView>

          {/* Category Breakdown */}
          <ThemedText style={styles.sectionTitle}>Breakdown by Category</ThemedText>
          <View style={styles.catList}>
            {categories.map((cat, i) => (
              <ThemedView key={i} type="backgroundElement" style={[styles.catCard, { borderColor: theme.border }]}>
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <View style={{ flex: 1, gap: 8 }}>
                  <View style={styles.catTopRow}>
                    <ThemedText style={styles.catName}>{cat.name}</ThemedText>
                    <ThemedText style={[styles.catAmount, { color: cat.color }]}>${cat.amount.toFixed(2)}</ThemedText>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
                    <View style={[styles.progressFill, { width: `${cat.pct}%`, backgroundColor: cat.color }]} />
                  </View>
                  <ThemedText style={[styles.catPct, { color: theme.textSecondary }]}>{cat.pct.toFixed(1)}% of expenses</ThemedText>
                </View>
              </ThemedView>
            ))}
          </View>

          {/* Smart Insight */}
          <LinearGradient colors={['#1E1F3A', '#2D2060']} style={styles.insightCard}>
            <View style={[styles.insightIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="bulb" size={22} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.insightTitle}>Smart Insight</ThemedText>
              <ThemedText style={styles.insightText}>
                Your Food spending is 12% lower than last month. Keep it up to reach your savings goal early!
              </ThemedText>
            </View>
          </LinearGradient>

        </View>
        <View style={{ height: BottomTabInset + Spacing.five }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { alignItems: 'center' },
  inner: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.three, gap: Spacing.three },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: Spacing.two },
  headerSub: { fontSize: 12, fontWeight: '600', color: '#64748B', letterSpacing: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginTop: 2 },
  monthPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.full, borderWidth: 1 },
  monthText: { fontSize: 13, fontWeight: '600' },

  summaryRow: { flexDirection: 'row', gap: Spacing.two },
  summaryCard: { flex: 1, padding: Spacing.two + 4, borderRadius: Radii.lg, borderWidth: 1, gap: 6 },
  summaryIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  summaryLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  summaryValue: { fontSize: 15, fontWeight: '800' },

  chartCard: { padding: Spacing.three, borderRadius: Radii.xl, borderWidth: 1, gap: Spacing.three },
  chartTitle: { fontSize: 15, fontWeight: '700' },
  barChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
  barCol: { alignItems: 'center', flex: 1, gap: 6 },
  barValue: { fontSize: 10, fontWeight: '600' },
  barTrack: { width: '70%', justifyContent: 'flex-end', borderRadius: 6, overflow: 'visible' },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 11, marginTop: 4 },

  sectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  catList: { gap: Spacing.two },
  catCard: { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.three, borderRadius: Radii.lg, borderWidth: 1, gap: Spacing.two },
  catDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  catTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { fontSize: 14, fontWeight: '700' },
  catAmount: { fontSize: 14, fontWeight: '700' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, minWidth: 6 },
  catPct: { fontSize: 11, fontWeight: '500' },

  insightCard: { flexDirection: 'row', borderRadius: Radii.xl, padding: Spacing.three, gap: Spacing.three, alignItems: 'flex-start' },
  insightIcon: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  insightTitle: { fontSize: 14, fontWeight: '700', color: '#E8EAFF', marginBottom: 4 },
  insightText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
});
