import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const { holdings, balance, resetAllData } = useFinanceData();
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const portfolioValue = holdings.reduce((sum, h) => sum + h.price * h.shares, 0);
  const netWorth = balance + portfolioValue;

  const handleResetData = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Reset all data to defaults?')) resetAllData();
    } else {
      Alert.alert('Reset Data', 'Are you sure you want to reset all data?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetAllData },
      ]);
    }
  };

  const metrics = [
    { label: 'Net Worth', value: `$${netWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, color: theme.accent },
    { label: 'Cash', value: `$${balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, color: '#22C55E' },
    { label: 'Invested', value: `$${portfolioValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, color: '#F59E0B' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>

          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>My Profile</ThemedText>
          </View>

          {/* Profile Card */}
          <LinearGradient
            colors={['#1E1F3A', '#2D1B69', '#1a1040']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.profileCard}>
            <View style={[styles.decorCircle, { width: 200, height: 200, top: -80, right: -60 }]} />
            <View style={[styles.decorCircle, { width: 120, height: 120, top: 20, right: 80 }]} />

            <View style={styles.profileTop}>
              <View style={styles.avatarWrap}>
                <LinearGradient colors={['#818CF8', '#6366F1']} style={styles.avatarGradient}>
                  <Ionicons name="person" size={38} color="#fff" />
                </LinearGradient>
                <View style={styles.onlineDot} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.profileName}>Alex Morgan</ThemedText>
                <ThemedText style={styles.profileEmail}>alex.morgan@wealthify.com</ThemedText>
                <View style={styles.goldBadge}>
                  <Ionicons name="star" size={10} color="#F59E0B" />
                  <ThemedText style={styles.goldText}>GOLD MEMBER</ThemedText>
                </View>
              </View>
            </View>

            {/* Metrics */}
            <View style={styles.metricsRow}>
              {metrics.map((m, i) => (
                <React.Fragment key={m.label}>
                  {i > 0 && <View style={styles.metricDivider} />}
                  <View style={styles.metricItem}>
                    <ThemedText style={styles.metricLabel}>{m.label}</ThemedText>
                    <ThemedText style={[styles.metricValue, { color: m.color }]}>{m.value}</ThemedText>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </LinearGradient>

          {/* Preferences */}
          <ThemedText style={styles.sectionLabel}>Preferences</ThemedText>
          <ThemedView type="backgroundElement" style={[styles.settingsGroup, { borderColor: theme.border }]}>
            {[
              {
                icon: 'notifications' as const,
                iconColor: '#818CF8',
                label: 'Push Notifications',
                value: notificationsEnabled,
                onToggle: setNotificationsEnabled,
              },
              {
                icon: 'finger-print' as const,
                iconColor: '#22C55E',
                label: 'Biometric Security',
                value: biometricsEnabled,
                onToggle: setBiometricsEnabled,
              },
            ].map((item, i, arr) => (
              <View key={item.label} style={[styles.prefRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                <View style={[styles.prefIcon, { backgroundColor: item.iconColor + '20' }]}>
                  <Ionicons name={item.icon} size={16} color={item.iconColor} />
                </View>
                <ThemedText style={styles.prefLabel}>{item.label}</ThemedText>
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ true: theme.accent }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </ThemedView>

          {/* Maintenance */}
          <ThemedText style={styles.sectionLabel}>Maintenance</ThemedText>
          <ThemedView type="backgroundElement" style={[styles.settingsGroup, { borderColor: theme.border }]}>
            <Pressable
              onPress={handleResetData}
              style={({ pressed }) => [styles.actionRow, pressed && { backgroundColor: theme.backgroundSelected }]}>
              <View style={[styles.prefIcon, { backgroundColor: '#EF444420' }]}>
                <Ionicons name="refresh" size={16} color="#EF4444" />
              </View>
              <ThemedText style={[styles.prefLabel, { color: '#EF4444' }]}>Reset Mock App Data</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
            </Pressable>
          </ThemedView>

          {/* App Info */}
          <View style={styles.appInfo}>
            <View style={[styles.appInfoIcon, { backgroundColor: theme.backgroundElement }]}>
              <Ionicons name="shield-checkmark" size={18} color={theme.accent} />
            </View>
            <View>
              <ThemedText style={[styles.appInfoLabel, { color: theme.textSecondary }]}>Wealthify Mobile v1.4.2</ThemedText>
              <ThemedText style={[styles.appInfoSub, { color: theme.textSecondary }]}>Secure connection verified ·  256-bit encryption</ThemedText>
            </View>
          </View>

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

  header: { paddingTop: Spacing.two },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },

  profileCard: { borderRadius: 24, padding: Spacing.four, gap: Spacing.three, overflow: 'hidden' },
  decorCircle: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.05)' },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatarWrap: { position: 'relative' },
  avatarGradient: { width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#1E1F3A' },
  profileName: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  profileEmail: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2, fontWeight: '500' },
  goldBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F59E0B20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 6, alignSelf: 'flex-start' },
  goldText: { fontSize: 10, fontWeight: '800', color: '#F59E0B' },
  metricsRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: Radii.lg, padding: Spacing.three },
  metricItem: { flex: 1, alignItems: 'center', gap: 4 },
  metricDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
  metricLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  metricValue: { fontSize: 15, fontWeight: '800' },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', letterSpacing: 0.8, marginBottom: -Spacing.one },
  settingsGroup: { borderRadius: Radii.xl, borderWidth: 1, overflow: 'hidden' },
  prefRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.three, paddingHorizontal: Spacing.three, gap: Spacing.two },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.three, paddingHorizontal: Spacing.three, gap: Spacing.two },
  prefIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  prefLabel: { flex: 1, fontSize: 14, fontWeight: '600' },

  appInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.three },
  appInfoIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  appInfoLabel: { fontSize: 13, fontWeight: '600' },
  appInfoSub: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});
