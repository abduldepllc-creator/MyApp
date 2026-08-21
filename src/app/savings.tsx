import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { SavingsGoal, useFinanceData } from '@/hooks/use-finance-data';
import { useTheme } from '@/hooks/use-theme';

const GOAL_COLORS = ['#818CF8', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

export default function SavingsScreen() {
  const { savingsGoals, balance, addMoneyToGoal } = useFinanceData();
  const theme = useTheme();
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddFunds = () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) { setErrorMsg('Enter a valid amount'); return; }
    if (amount > balance) { setErrorMsg('Exceeds available cash'); return; }
    if (selectedGoal) {
      const ok = addMoneyToGoal(selectedGoal.id, amount);
      if (ok) { setSelectedGoal(null); setAddAmount(''); setErrorMsg(''); }
      else setErrorMsg('Transaction failed');
    }
  };

  const totalSaved = savingsGoals.reduce((s, g) => s + g.current, 0);
  const totalTarget = savingsGoals.reduce((s, g) => s + g.target, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.headerSub}>Manage</ThemedText>
              <ThemedText style={styles.headerTitle}>Savings Goals</ThemedText>
            </View>
            <View style={[styles.cashBadge, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Ionicons name="wallet" size={14} color={theme.accent} />
              <ThemedText style={[styles.cashText, { color: theme.accent }]}>${balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}</ThemedText>
            </View>
          </View>

          {/* Overview Card */}
          <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.overviewCard}>
            <View style={[styles.decorCircle, { width: 160, height: 160, top: -60, right: -30 }]} />
            <View style={styles.overviewRow}>
              <View>
                <ThemedText style={styles.overviewLabel}>Total Saved</ThemedText>
                <ThemedText style={styles.overviewValue}>${totalSaved.toLocaleString()}</ThemedText>
              </View>
              <View style={[styles.overviewDivider]} />
              <View style={{ alignItems: 'flex-end' }}>
                <ThemedText style={styles.overviewLabel}>Target</ThemedText>
                <ThemedText style={styles.overviewValue}>${totalTarget.toLocaleString()}</ThemedText>
              </View>
            </View>
            <View style={styles.overviewProgress}>
              <View style={styles.overviewTrack}>
                <View style={[styles.overviewFill, { width: `${Math.min(100, (totalSaved / Math.max(totalTarget, 1)) * 100)}%` }]} />
              </View>
              <ThemedText style={styles.overviewPct}>{((totalSaved / Math.max(totalTarget, 1)) * 100).toFixed(0)}% of all goals</ThemedText>
            </View>
          </LinearGradient>

          {/* Goals */}
          <ThemedText style={styles.sectionTitle}>Your Goals</ThemedText>
          <View style={styles.goalsList}>
            {savingsGoals.map((goal, idx) => {
              const pct = Math.min(1, goal.current / goal.target);
              const remaining = goal.target - goal.current;
              const color = GOAL_COLORS[idx % GOAL_COLORS.length];
              return (
                <ThemedView key={goal.id} type="backgroundElement" style={[styles.goalCard, { borderColor: theme.border }]}>
                  <View style={styles.goalHeader}>
                    <View style={[styles.goalDot, { backgroundColor: color + '30', borderColor: color }]}>
                      <View style={[styles.goalDotInner, { backgroundColor: color }]} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
                      <ThemedText style={[styles.goalCategory, { color: theme.textSecondary }]}>{goal.category}</ThemedText>
                    </View>
                    <Pressable
                      onPress={() => { setSelectedGoal(goal); setAddAmount(''); setErrorMsg(''); }}
                      style={[styles.addBtn, { backgroundColor: color + '20', borderColor: color + '50' }]}>
                      <Ionicons name="add" size={14} color={color} />
                      <ThemedText style={[styles.addBtnText, { color }]}>Add</ThemedText>
                    </Pressable>
                  </View>

                  <View style={styles.goalAmounts}>
                    <ThemedText style={[styles.goalSaved, { color }]}>${goal.current.toLocaleString()}</ThemedText>
                    <ThemedText style={[styles.goalOf, { color: theme.textSecondary }]}>of ${goal.target.toLocaleString()}</ThemedText>
                  </View>

                  <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
                    <LinearGradient
                      colors={[color, color + 'AA']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${pct * 100}%` }]}
                    />
                  </View>

                  <View style={styles.goalFooter}>
                    <ThemedText style={[styles.goalPct, { color: theme.textSecondary }]}>{(pct * 100).toFixed(0)}% complete</ThemedText>
                    {remaining > 0
                      ? <ThemedText style={[styles.goalRemaining, { color: theme.textSecondary }]}>${remaining.toLocaleString()} left</ThemedText>
                      : <ThemedText style={[styles.goalRemaining, { color: '#22C55E', fontWeight: '700' }]}>🎉 Goal Met!</ThemedText>
                    }
                  </View>
                </ThemedView>
              );
            })}
          </View>
        </View>
        <View style={{ height: BottomTabInset + Spacing.five }} />
      </ScrollView>

      {/* Add Funds Modal */}
      {selectedGoal && (
        <Modal transparent visible animationType="slide">
          <View style={styles.modalOverlay}>
            <ThemedView type="backgroundElement" style={[styles.modalSheet, { borderColor: theme.border }]}>
              <View style={[styles.dragHandle, { backgroundColor: theme.backgroundSelected }]} />

              <View style={styles.modalHeader}>
                <View>
                  <ThemedText style={styles.modalTitle}>Fund Goal</ThemedText>
                  <ThemedText style={[styles.modalSub, { color: theme.textSecondary }]}>{selectedGoal.title}</ThemedText>
                </View>
                <Pressable onPress={() => setSelectedGoal(null)} style={[styles.closeBtn, { backgroundColor: theme.backgroundSelected }]}>
                  <Ionicons name="close" size={18} color={theme.textSecondary} />
                </Pressable>
              </View>

              <View style={[styles.availRow, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText style={[styles.availLabel, { color: theme.textSecondary }]}>Available Cash</ThemedText>
                <ThemedText style={[styles.availValue, { color: theme.accent }]}>${balance.toFixed(2)}</ThemedText>
              </View>

              <TextInput
                placeholder="Enter amount ($)"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={addAmount}
                onChangeText={setAddAmount}
                style={[styles.modalInput, { color: theme.text, backgroundColor: theme.backgroundSelected, borderColor: theme.border }]}
              />

              {errorMsg ? <ThemedText style={styles.errorMsg}>{errorMsg}</ThemedText> : null}

              <Pressable onPress={handleAddFunds} style={[styles.confirmBtn, { backgroundColor: theme.accent }]}>
                <ThemedText style={styles.confirmText}>Add Funds</ThemedText>
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

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: Spacing.two },
  headerSub: { fontSize: 12, fontWeight: '600', color: '#64748B', letterSpacing: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginTop: 2 },
  cashBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radii.full, borderWidth: 1 },
  cashText: { fontSize: 13, fontWeight: '700' },

  overviewCard: { borderRadius: 24, padding: Spacing.four, overflow: 'hidden', gap: Spacing.three },
  decorCircle: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.05)' },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overviewLabel: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600', marginBottom: 4, letterSpacing: 1 },
  overviewValue: { fontSize: 24, lineHeight: 30, fontWeight: '800', color: '#fff' },
  overviewDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.15)' },
  overviewProgress: { gap: 8 },
  overviewTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' },
  overviewFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 3 },
  overviewPct: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  sectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  goalsList: { gap: Spacing.two },
  goalCard: { padding: Spacing.three, borderRadius: Radii.xl, borderWidth: 1, gap: Spacing.two },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  goalDot: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  goalDotInner: { width: 12, height: 12, borderRadius: 6 },
  goalTitle: { fontSize: 14, fontWeight: '700' },
  goalCategory: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radii.full, borderWidth: 1 },
  addBtnText: { fontSize: 12, fontWeight: '700' },
  goalAmounts: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  goalSaved: { fontSize: 20, fontWeight: '800' },
  goalOf: { fontSize: 13, fontWeight: '500' },
  progressTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, minWidth: 7 },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  goalPct: { fontSize: 12, fontWeight: '500' },
  goalRemaining: { fontSize: 12, fontWeight: '500' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three, borderWidth: 1, borderBottomWidth: 0 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSub: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  availRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radii.md },
  availLabel: { fontSize: 13, fontWeight: '500' },
  availValue: { fontSize: 13, fontWeight: '700' },
  modalInput: { height: 52, borderRadius: Radii.md, borderWidth: 1, paddingHorizontal: Spacing.three, fontSize: 16, fontWeight: '600' },
  errorMsg: { color: '#EF4444', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  confirmBtn: { height: 54, borderRadius: Radii.full, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
