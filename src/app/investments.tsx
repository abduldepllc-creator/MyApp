import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Modal, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Colors, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useTheme } from '@/hooks/use-theme';

export default function InvestmentsScreen() {
  const { holdings, balance, buyAsset, sellAsset } = useFinanceData();
  const theme = useTheme();
  const scheme = useColorScheme() ?? 'dark';
  const [filterType, setFilterType] = useState<'all' | 'crypto' | 'stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [sharesInput, setSharesInput] = useState('');
  const [tradeMessage, setTradeMessage] = useState('');

  const portfolioValue = holdings.reduce((sum, h) => sum + h.price * h.shares, 0);

  const filteredHoldings = holdings.filter((h) => {
    const matchesType = filterType === 'all' || h.type === filterType;
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleTrade = () => {
    const shares = parseFloat(sharesInput);
    if (isNaN(shares) || shares <= 0) { setTradeMessage('Please enter a valid amount'); return; }
    if (tradeType === 'buy') {
      const ok = buyAsset(selectedAsset.id, shares);
      if (ok) { setTradeMessage(`Bought ${shares} shares!`); setTimeout(() => { setSelectedAsset(null); setSharesInput(''); setTradeMessage(''); }, 1500); }
      else setTradeMessage('Insufficient balance');
    } else {
      const ok = sellAsset(selectedAsset.id, shares);
      if (ok) { setTradeMessage(`Sold ${shares} shares!`); setTimeout(() => { setSelectedAsset(null); setSharesInput(''); setTradeMessage(''); }, 1500); }
      else setTradeMessage('Not enough shares');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.headerSub}>Your Portfolio</ThemedText>
              <ThemedText style={styles.headerTitle}>Wealth Portfolio</ThemedText>
            </View>
            <ThemedText style={[styles.liveTag, { color: Colors[scheme].success, backgroundColor: Colors[scheme].success + '20' }]}>● LIVE</ThemedText>
          </View>

          {/* Portfolio Card */}
          <LinearGradient
            colors={scheme === 'dark' ? ['#0F2027', '#203A43', '#2C5364'] : ['#1a3a5c', '#2563EB', '#3B82F6']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.portfolioCard}>
            <View style={[styles.decorCircle, styles.dc1]} />
            <View style={[styles.decorCircle, styles.dc2]} />
            <ThemedText style={styles.portfolioLabel}>PORTFOLIO VALUE</ThemedText>
            <ThemedText style={styles.portfolioValue}>
              ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </ThemedText>
            <View style={styles.portfolioMeta}>
              <View>
                <ThemedText style={styles.metaLabel}>Cash Balance</ThemedText>
                <ThemedText style={styles.metaValue}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</ThemedText>
              </View>
              <View style={styles.divider} />
              <View style={{ alignItems: 'flex-end' }}>
                <ThemedText style={styles.metaLabel}>Total Assets</ThemedText>
                <ThemedText style={[styles.metaValue, { color: Colors[scheme].success }]}>
                  ${(portfolioValue + balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </ThemedText>
              </View>
            </View>
          </LinearGradient>

          {/* Search */}
          <View style={[styles.searchBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Ionicons name="search" size={16} color={theme.textSecondary} />
            <TextInput
              placeholder="Search stocks, crypto..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: theme.text }]}
            />
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterRow}>
            {(['all', 'stock', 'crypto'] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setFilterType(t)}
                style={[
                  styles.filterBtn,
                  { borderColor: theme.border, backgroundColor: filterType === t ? theme.accent : theme.backgroundElement }
                ]}>
                <ThemedText style={[styles.filterLabel, { color: filterType === t ? '#fff' : theme.textSecondary, textTransform: 'capitalize' }]}>
                  {t}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {/* Asset List */}
          <View style={styles.assetList}>
            {filteredHoldings.map((asset) => {
              const isPos = asset.change >= 0;
              return (
                <Pressable
                  key={asset.id}
                  onPress={() => { setSelectedAsset(asset); setTradeType('buy'); setSharesInput(''); setTradeMessage(''); }}
                  style={({ pressed }) => [
                    styles.assetCard,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.88 : 1 }
                  ]}>
                  <View style={[styles.assetAvatar, { backgroundColor: theme.backgroundSelected }]}>
                    <ThemedText style={[styles.assetAvatarText, { color: theme.accent }]}>
                      {asset.symbol.substring(0, 2)}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.assetName}>{asset.name}</ThemedText>
                    <ThemedText style={[styles.assetSymbol, { color: theme.textSecondary }]}>
                      {asset.shares > 0 ? `${asset.shares} shares` : asset.symbol}
                    </ThemedText>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <ThemedText style={styles.assetPrice}>${asset.price.toLocaleString()}</ThemedText>
                    <View style={[styles.changePill, { backgroundColor: isPos ? '#22C55E20' : '#EF444420' }]}>
                      <ThemedText style={[styles.changeText, { color: isPos ? '#22C55E' : '#EF4444' }]}>
                        {isPos ? '+' : ''}{asset.change.toFixed(2)}%
                      </ThemedText>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={{ height: BottomTabInset + Spacing.five }} />
      </ScrollView>

      {/* Trade Modal */}
      {selectedAsset && (
        <Modal transparent visible animationType="slide">
          <View style={styles.modalOverlay}>
            <ThemedView type="backgroundElement" style={[styles.modalSheet, { borderColor: theme.border }]}>
              {/* Drag handle */}
              <View style={[styles.dragHandle, { backgroundColor: theme.backgroundSelected }]} />

              <View style={styles.modalHeader}>
                <View>
                  <ThemedText style={styles.modalTitle}>Trade {selectedAsset.symbol}</ThemedText>
                  <ThemedText style={[styles.modalPrice, { color: theme.textSecondary }]}>
                    Current: <ThemedText style={[styles.modalPrice, { color: theme.text, fontWeight: '700' }]}>${selectedAsset.price}</ThemedText>
                  </ThemedText>
                </View>
                <Pressable onPress={() => setSelectedAsset(null)} style={[styles.closeBtn, { backgroundColor: theme.backgroundSelected }]}>
                  <Ionicons name="close" size={18} color={theme.textSecondary} />
                </Pressable>
              </View>

              {/* Buy / Sell toggle */}
              <View style={[styles.tradeToggle, { backgroundColor: theme.backgroundSelected }]}>
                {(['buy', 'sell'] as const).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTradeType(t)}
                    style={[
                      styles.tradeToggleBtn,
                      tradeType === t && { backgroundColor: t === 'buy' ? '#22C55E' : '#EF4444', shadowColor: t === 'buy' ? '#22C55E' : '#EF4444', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 }
                    ]}>
                    <ThemedText style={[styles.tradeToggleLabel, { color: tradeType === t ? '#fff' : theme.textSecondary, textTransform: 'capitalize' }]}>
                      {t}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {/* Available */}
              <View style={[styles.availableRow, { backgroundColor: theme.backgroundSelected, borderRadius: Radii.md }]}>
                <ThemedText style={[styles.availableLabel, { color: theme.textSecondary }]}>
                  {tradeType === 'buy' ? 'Available Cash' : 'Available Shares'}
                </ThemedText>
                <ThemedText style={[styles.availableValue, { color: theme.accent }]}>
                  {tradeType === 'buy' ? `$${balance.toFixed(2)}` : `${selectedAsset.shares} ${selectedAsset.symbol}`}
                </ThemedText>
              </View>

              <TextInput
                placeholder="Number of shares"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={sharesInput}
                onChangeText={setSharesInput}
                style={[styles.modalInput, { color: theme.text, backgroundColor: theme.backgroundSelected, borderColor: theme.border }]}
              />

              {sharesInput ? (
                <View style={[styles.estimateRow, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText style={[styles.estimateLabel, { color: theme.textSecondary }]}>
                    Est. {tradeType === 'buy' ? 'Cost' : 'Proceeds'}:
                  </ThemedText>
                  <ThemedText style={[styles.estimateValue, { color: theme.text }]}>
                    ${(parseFloat(sharesInput || '0') * selectedAsset.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </ThemedText>
                </View>
              ) : null}

              {tradeMessage ? (
                <ThemedText style={[styles.tradeMsg, { color: tradeMessage.includes('uccessfully') || tradeMessage.includes('ought') || tradeMessage.includes('old') ? '#22C55E' : '#EF4444' }]}>
                  {tradeMessage}
                </ThemedText>
              ) : null}

              <Pressable
                onPress={handleTrade}
                style={[styles.confirmBtn, { backgroundColor: tradeType === 'buy' ? '#22C55E' : '#EF4444' }]}>
                <ThemedText style={styles.confirmBtnText}>
                  Confirm {tradeType === 'buy' ? 'Purchase' : 'Sale'}
                </ThemedText>
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
  liveTag: { fontSize: 11, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },

  portfolioCard: { borderRadius: 24, padding: Spacing.four, overflow: 'hidden', gap: Spacing.two },
  decorCircle: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.05)' },
  dc1: { width: 200, height: 200, top: -80, right: -50 },
  dc2: { width: 130, height: 130, top: 20, right: 80 },
  portfolioLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, color: 'rgba(255,255,255,0.6)' },
  portfolioValue: { fontSize: 38, fontWeight: '800', letterSpacing: -1, color: '#fff' },
  portfolioMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  metaLabel: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600', marginBottom: 2 },
  metaValue: { fontSize: 15, fontWeight: '700', color: '#fff' },
  divider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.15)' },

  searchBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, height: 46, borderRadius: Radii.full, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },

  filterRow: { flexDirection: 'row', gap: Spacing.two },
  filterBtn: { flex: 1, height: 38, borderRadius: Radii.full, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  filterLabel: { fontSize: 13, fontWeight: '600' },

  assetList: { gap: Spacing.two },
  assetCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, borderRadius: Radii.lg, borderWidth: 1, gap: Spacing.three },
  assetAvatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  assetAvatarText: { fontSize: 15, fontWeight: '800' },
  assetName: { fontSize: 14, fontWeight: '700' },
  assetSymbol: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  assetPrice: { fontSize: 14, fontWeight: '800' },
  changePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  changeText: { fontSize: 11, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three, borderWidth: 1, borderBottomWidth: 0 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  modalPrice: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  tradeToggle: { flexDirection: 'row', borderRadius: Radii.full, padding: 4, gap: 4 },
  tradeToggleBtn: { flex: 1, height: 40, borderRadius: Radii.full, justifyContent: 'center', alignItems: 'center' },
  tradeToggleLabel: { fontSize: 14, fontWeight: '700' },
  availableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  availableLabel: { fontSize: 13, fontWeight: '500' },
  availableValue: { fontSize: 13, fontWeight: '700' },
  modalInput: { height: 52, borderRadius: Radii.md, borderWidth: 1, paddingHorizontal: Spacing.three, fontSize: 16, fontWeight: '600' },
  estimateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radii.md },
  estimateLabel: { fontSize: 13, fontWeight: '500' },
  estimateValue: { fontSize: 13, fontWeight: '700' },
  tradeMsg: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  confirmBtn: { height: 54, borderRadius: Radii.full, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
