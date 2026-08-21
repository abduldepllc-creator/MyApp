import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useTheme } from '@/hooks/use-theme';

export default function TransferScreen() {
  const { balance, addTransaction } = useFinanceData();
  const theme = useTheme();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [amountString, setAmountString] = useState('0');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const contacts = [
    { name: 'Alice Smith', initials: 'AS', color: '#818CF8' },
    { name: 'Bob Johnson', initials: 'BJ', color: '#22C55E' },
    { name: 'Charlie Davis', initials: 'CD', color: '#F59E0B' },
    { name: 'Diana Prince', initials: 'DP', color: '#EF4444' },
  ];

  const handleKeyPress = (val: string) => {
    setErrorMsg('');
    if (amountString === '0' && val !== '.') { setAmountString(val); return; }
    if (val === '.' && amountString.includes('.')) return;
    if (amountString.includes('.') && amountString.split('.')[1].length >= 2) return;
    setAmountString(prev => prev + val);
  };

  const handleBackspace = () => {
    setErrorMsg('');
    if (amountString.length <= 1) { setAmountString('0'); return; }
    setAmountString(prev => prev.slice(0, -1));
  };

  const handleTransfer = () => {
    const amountVal = parseFloat(amountString);
    if (!selectedContact) { setErrorMsg('Please select a contact'); return; }
    if (isNaN(amountVal) || amountVal <= 0) { setErrorMsg('Enter an amount greater than $0'); return; }
    if (amountVal > balance) { setErrorMsg('Insufficient balance'); return; }
    addTransaction(`Sent to ${selectedContact}`, 'Shopping', amountVal, 'expense');
    setShowSuccessModal(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false); setSelectedContact(null); setAmountString('0');
    router.push('/');
  };

  const keys = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['.', '0', 'DEL']];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.inner}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.headerSub}>Instant</ThemedText>
              <ThemedText style={styles.headerTitle}>Transfer Cash</ThemedText>
            </View>
            <View style={[styles.balancePill, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Ionicons name="wallet-outline" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.balancePillText, { color: theme.textSecondary }]}>
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </ThemedText>
            </View>
          </View>

          {/* Contact Selector */}
          <View>
            <ThemedText style={styles.sectionTitle}>Recipient</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.three }} contentContainerStyle={{ paddingHorizontal: Spacing.three, gap: Spacing.two, paddingVertical: 4 }}>
              {contacts.map((c) => {
                const isSelected = selectedContact === c.name;
                return (
                  <Pressable
                    key={c.name}
                    onPress={() => { setSelectedContact(c.name); setErrorMsg(''); }}
                    style={[styles.contactCard, { borderColor: isSelected ? c.color : theme.border, backgroundColor: isSelected ? c.color + '18' : theme.backgroundElement }]}>
                    <View style={[styles.contactAvatar, { backgroundColor: c.color + '25', borderColor: isSelected ? c.color : 'transparent', borderWidth: isSelected ? 2 : 0 }]}>
                      <ThemedText style={[styles.contactInitials, { color: c.color }]}>{c.initials}</ThemedText>
                    </View>
                    <ThemedText style={[styles.contactName, { color: isSelected ? c.color : theme.textSecondary }]}>
                      {c.name.split(' ')[0]}
                    </ThemedText>
                    {isSelected && <View style={[styles.contactCheck, { backgroundColor: c.color }]}><Ionicons name="checkmark" size={10} color="#fff" /></View>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Amount Display */}
          <LinearGradient
            colors={['#1E1F3A', '#2D2060']}
            style={styles.amountCard}>
            <ThemedText style={styles.amountLabel}>AMOUNT TO SEND</ThemedText>
            <ThemedText style={styles.amountDisplay}>
              ${parseFloat(amountString).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </ThemedText>
            {errorMsg
              ? <ThemedText style={styles.errorMsg}>{errorMsg}</ThemedText>
              : selectedContact
                ? <ThemedText style={styles.recipientNote}>→ {selectedContact}</ThemedText>
                : <ThemedText style={styles.recipientHint}>Select a recipient above</ThemedText>
            }
          </LinearGradient>

          {/* Keypad */}
          <View style={styles.keypad}>
            {keys.map((row, ri) => (
              <View key={ri} style={styles.keyRow}>
                {row.map((k) => (
                  <Pressable
                    key={k}
                    onPress={() => k === 'DEL' ? handleBackspace() : handleKeyPress(k)}
                    style={({ pressed }) => [
                      styles.key,
                      { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement, borderColor: theme.border }
                    ]}>
                    {k === 'DEL'
                      ? <Ionicons name="backspace" size={22} color={theme.text} />
                      : <ThemedText style={styles.keyText}>{k}</ThemedText>
                    }
                  </Pressable>
                ))}
              </View>
            ))}
          </View>

          {/* Send Button */}
          <LinearGradient
            colors={['#6366F1', '#818CF8']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.sendBtn}>
            <Pressable onPress={handleTransfer} style={styles.sendBtnInner}>
              <Ionicons name="send" size={18} color="#fff" />
              <ThemedText style={styles.sendBtnText}>Send Payment</ThemedText>
            </Pressable>
          </LinearGradient>

        </View>
        <View style={{ height: BottomTabInset + Spacing.five }} />
      </ScrollView>

      {/* Success Modal */}
      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={[styles.successModal, { borderColor: theme.border }]}>
            <LinearGradient colors={['#22C55E20', '#22C55E08']} style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={72} color="#22C55E" />
            </LinearGradient>
            <ThemedText style={styles.successTitle}>Transfer Successful!</ThemedText>
            <ThemedText style={[styles.successDesc, { color: theme.textSecondary }]}>
              You sent ${parseFloat(amountString).toFixed(2)} to {selectedContact}.
            </ThemedText>
            <Pressable onPress={handleCloseSuccess} style={[styles.doneBtn, { backgroundColor: theme.accent }]}>
              <ThemedText style={styles.doneBtnText}>Back to Home</ThemedText>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>
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
  balancePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radii.full, borderWidth: 1 },
  balancePillText: { fontSize: 13, fontWeight: '600' },

  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: Spacing.two, letterSpacing: 0.3 },
  contactCard: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: Radii.lg, borderWidth: 1.5, gap: 8, position: 'relative', minWidth: 80 },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  contactInitials: { fontSize: 14, fontWeight: '800' },
  contactName: { fontSize: 11, fontWeight: '600' },
  contactCheck: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  amountCard: { borderRadius: 24, padding: Spacing.four, alignItems: 'center', gap: 8 },
  amountLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: 'rgba(255,255,255,0.5)' },
  amountDisplay: { fontSize: 44, lineHeight: 52, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  errorMsg: { color: '#EF4444', fontSize: 13, fontWeight: '700' },
  recipientNote: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  recipientHint: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.35)' },

  keypad: { gap: Spacing.two },
  keyRow: { flexDirection: 'row', gap: Spacing.two },
  key: { flex: 1, height: 64, borderRadius: Radii.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  keyText: { fontSize: 24, fontWeight: '500' },

  sendBtn: { borderRadius: Radii.full, overflow: 'hidden', shadowColor: '#6366F1', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  sendBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, gap: 10 },
  sendBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)', padding: Spacing.four },
  successModal: { width: '100%', maxWidth: 380, borderRadius: 28, padding: Spacing.five, alignItems: 'center', gap: Spacing.three, borderWidth: 1 },
  successIconWrap: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  successTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  successDesc: { fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 21 },
  doneBtn: { width: '100%', height: 52, borderRadius: Radii.full, justifyContent: 'center', alignItems: 'center' },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
