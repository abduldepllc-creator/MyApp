import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: { name: string; title: string; icon: IoniconName; activeIcon: IoniconName }[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'analytics', title: 'Analytics', icon: 'pie-chart-outline', activeIcon: 'pie-chart' },
  { name: 'investments', title: 'Market', icon: 'trending-up-outline', activeIcon: 'trending-up' },
  { name: 'savings', title: 'Savings', icon: 'wallet-outline', activeIcon: 'wallet' },
  { name: 'budgets', title: 'Budgets', icon: 'card-outline', activeIcon: 'card' },
  { name: 'transfer', title: 'Transfer', icon: 'swap-horizontal-outline', activeIcon: 'swap-horizontal' },
  { name: 'profile', title: 'Profile', icon: 'person-circle-outline', activeIcon: 'person-circle' },
];

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || scheme == null ? 'dark' : scheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.backgroundElement,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}>
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? tab.activeIcon : tab.icon}
                size={23}
                color={color}
              />
            ),
          }}
        />
      ))}

      {/* Hidden screens */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
