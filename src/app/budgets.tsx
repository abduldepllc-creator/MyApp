import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { Budget, useFinanceData } from '@/hooks/use-finance-data';
import { useTheme } from '@/hooks/use-theme';

export default function BudgetsScreen() {
  const { budgets, updateBudgetLimit } = useFinanceData();
  const theme = useTheme();
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdateLimit = () => {
    const limit = parseFloat(limitInput);
    if (isNaN(limit) || limit <= 0) { setErrorMsg('Enter a valid limit'); return; }
    if (selectedBudget) {
      updateBudgetLimit(selectedBudget.category, limit);
      setSelectedBudget(null); setLimitInput(''); setErrorMsg('');
    }
  };

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overallRatio = totalLimit > 0 ? totalSpent / totalLimit : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.headerSub}>Track Spending</ThemedText>
              <ThemedText style={styles.headerTitle}>Budget Planner</ThemedText>
            </View>
          </View>

          {/* Overview Card */}
          <LinearGradient
            colors={['#1a1040', '#2D1B69', '#3730A3']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.overviewCard}>
            <View style={styles.overviewTop}>
              <View>
                <ThemedText style={styles.ovLabel}>TOTAL SPENT</ThemedText>
                <ThemedText style={styles.ovSpent}>${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</ThemedText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <ThemedText style={styles.ovLabel}>TOTAL BUDGET</ThemedText>
                <ThemedText style={styles.ovTotal}>${totalLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</ThemedText>
              </View>
            </View>
            <View style={styles.ovTrack}>
              <View style={[styles.ovFill, {
                width: `${Math.min(100, overallRatio * 100)}%`,
                backgroundColor: overallRatio > 1 ? '#EF4444' : overallRatio > 0.85 ? '#F59E0B' : '#22C55E'
              }]} />
            </View>
            <ThemedText style={styles.ovPct}>
              {(overallRatio * 100).toFixed(0)}% of monthly budget used
            </ThemedText>
          </LinearGradient>

          {/* Budget Cards */}
          <ThemedText style={styles.sectionTitle}>Categories</ThemedText>
          <View style={styles.budgetList}>
            {budgets.map((budget) => {
              const ratio = budget.spent / budget.limit;
              const pct = Math.min(1, ratio);
              const isOver = ratio > 1;
              const isWarn = ratio >= 0.85;
              const barColor = isOver ? '#EF4444' : isWarn ? '#F59E0B' : budget.color;

              return (
                <ThemedView key={budget.category} type="backgroundElement" style={[styles.budgetCard, { borderColor: theme.border }]}>
                  <View style={styles.budgetTop}>
                    <View style={styles.budgetLeft}>
                      <View style={[styles.categoryDot, { backgroundColor: budget.color + '30', borderColor: budget.color }]}>
                        <View style={[styles.categoryDotInner, { backgroundColor: budget.color }]} />
                      </View>
                      <View>
                        <ThemedText style={styles.categoryName}>{budget.category}</ThemedText>
                        <ThemedText style={[styles.categoryPct, { color: barColor }]}>{(pct * 100).toFixed(0)}% used</ThemedText>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => { setSelectedBudget(budget); setLimitInput(budget.limit.toString()); setErrorMsg(''); }}
                      style={[styles.editBtn, { backgroundColor: theme.backgroundSelected }]}>
                      <Ionicons name="pencil" size={12} color={theme.textSecondary} />
                      <ThemedText style={[styles.editBtnText, { color: theme.textSecondary }]}>Edit</ThemedText>
                    </Pressable>
                  </View>

                  <View style={styles.budgetAmounts}>
                    <ThemedText style={[styles.budgetSpent, { color: barColor }]}>${budget.spent.toFixed(2)}</ThemedText>
                    <ThemedText style={[styles.budgetOf, { color: theme.textSecondary }]}>/ ${budget.limit.toFixed(2)}</ThemedText>
                  </View>

                  <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
                    <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
                  </View>

                  {isOver ? (
                    <View style={styles.alertRow}>
                      <Ionicons name="warning" size={12} color="#EF4444" />
                      <ThemedText style={[styles.alertText, { color: '#EF4444' }]}>
                        Over by ${(budget.spent - budget.limit).toFixed(2)}
                      </ThemedText>
                    </View>
                  ) : isWarn ? (
                    <View style={styles.alertRow}>
                      <Ionicons name="alert-circle" size={12} color="#F59E0B" />
                      <ThemedText style={[styles.alertText, { color: '#F59E0B' }]}>
                        ${(budget.limit - budget.spent).toFixed(2)} remaining — approaching limit
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText style={[styles.safeText, { color: theme.textSecondary }]}>
                      ${(budget.limit - budget.spent).toFixed(2)} remaining
                    </ThemedText>
                  )}
                </ThemedView>
              );
            })}
          </View>
        </View>
        <View style={{ height: BottomTabInset + Spacing.five }} />
      </ScrollView>

      {/* Edit Modal */}
      {selectedBudget && (
        <Modal transparent visible animationType="slide">
          <View style={styles.modalOverlay}>
            <ThemedView type="backgroundElement" style={[styles.modalSheet, { borderColor: theme.border }]}>
              <View style={[styles.dragHandle, { backgroundColor: theme.backgroundSelected }]} />
              <View style={styles.modalHeader}>
                <View>
                  <ThemedText style={styles.modalTitle}>Adjust Limit</ThemedText>
                  <ThemedText style={[styles.modalSub, { color: theme.textSecondary }]}>{selectedBudget.category}</ThemedText>
                </View>
                <Pressable onPress={() => setSelectedBudget(null)} style={[styles.closeBtn, { backgroundColor: theme.backgroundSelected }]}>
                  <Ionicons name="close" size={18} color={theme.textSecondary} />
                </Pressable>
              </View>

              <View style={[styles.currentRow, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText style={[styles.currentLabel, { color: theme.textSecondary }]}>Current Limit</ThemedText>
                <ThemedText style={[styles.currentValue, { color: theme.accent }]}>${selectedBudget.limit.toFixed(2)}</ThemedText>
              </View>

              <TextInput
                placeholder="New limit ($)"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={limitInput}
                onChangeText={setLimitInput}
                style={[styles.modalInput, { color: theme.text, backgroundColor: theme.backgroundSelected, borderColor: theme.border }]}
              />

              {errorMsg ? <ThemedText style={styles.errorMsg}>{errorMsg}</ThemedText> : null}

              <Pressable onPress={handleUpdateLimit} style={[styles.confirmBtn, { backgroundColor: theme.accent }]}>
                <ThemedText style={styles.confirmText}>Update Limit</ThemedText>
              </Pressable>
            </ThemedView>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { alignItems: 'center' },
  inner: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.three, gap: Spacing.three },

  header: { paddingTop: Spacing.two },
  headerSub: { fontSize: 12, fontWeight: '600', color: '#64748B', letterSpacing: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginTop: 2 },

  overviewCard: { borderRadius: 24, padding: Spacing.four, gap: Spacing.three, overflow: 'hidden' },
  overviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  ovLabel: { fontSize: 10, letterSpacing: 1.5, color: 'rgba(255,255,255,0.55)', fontWeight: '700', marginBottom: 4 },
  ovSpent: { fontSize: 26, lineHeight: 32, fontWeight: '800', color: '#fff' },
  ovTotal: { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  ovTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' },
  ovFill: { height: '100%', borderRadius: 4, minWidth: 8 },
  ovPct: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  sectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  budgetList: { gap: Spacing.two },
  budgetCard: { padding: Spacing.three, borderRadius: Radii.xl, borderWidth: 1, gap: Spacing.two },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  categoryDot: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  categoryDotInner: { width: 12, height: 12, borderRadius: 6 },
  categoryName: { fontSize: 14, fontWeight: '700' },
  categoryPct: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radii.full },
  editBtnText: { fontSize: 12, fontWeight: '600' },
  budgetAmounts: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  budgetSpent: { fontSize: 20, fontWeight: '800' },
  budgetOf: { fontSize: 13, fontWeight: '500' },
  progressTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, minWidth: 7 },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertText: { fontSize: 12, fontWeight: '600' },
  safeText: { fontSize: 12, fontWeight: '500' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three, borderWidth: 1, borderBottomWidth: 0 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSub: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  currentRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radii.md },
  currentLabel: { fontSize: 13, fontWeight: '500' },
  currentValue: { fontSize: 13, fontWeight: '700' },
  modalInput: { height: 52, borderRadius: Radii.md, borderWidth: 1, paddingHorizontal: Spacing.three, fontSize: 16, fontWeight: '600' },
  errorMsg: { color: '#EF4444', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  confirmBtn: { height: 54, borderRadius: Radii.full, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
