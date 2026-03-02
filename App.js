import React, { useState, useMemo } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StatusBar, StyleSheet, Alert } from 'react-native';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { SimulationScreen } from './src/screens/SimulationScreen';
import { theme } from './src/utils/theme';

const INITIAL_BALANCE = 100000; // sanal bakiye (TL)
const XP_PER_LEVEL = 1000;

export default function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [positionSize, setPositionSize] = useState(0); // adet

  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [totalRealizedPnl, setTotalRealizedPnl] = useState(0);

  const portfolio = useMemo(
    () => ({
      balance,
      positionSize,
      level,
      xp,
      totalRealizedPnl,
    }),
    [balance, positionSize, level, xp, totalRealizedPnl]
  );

  const resetGame = () => {
    setBalance(INITIAL_BALANCE);
    setPositionSize(0);
    setLevel(1);
    setXp(0);
    setTotalRealizedPnl(0);
  };

  const checkLevelUp = (nextXp, currentLevel) => {
    const targetLevel = Math.max(1, Math.floor(nextXp / XP_PER_LEVEL) + 1);
    return targetLevel > currentLevel ? targetLevel : currentLevel;
  };

  const checkGameOver = (portfolioValue) => {
    const marginThreshold = INITIAL_BALANCE * 0.1;
    if (portfolioValue <= marginThreshold) {
      Alert.alert(
        'İflas Ettin! (Margin Call)',
        'Risk yönetimini öğrenmelisin. Oyun başlangıç noktasına sıfırlandı.',
        [{ text: 'Yeniden Başla', onPress: resetGame }],
        { cancelable: false }
      );
    }
  };

  const handlePortfolioUpdate = (update) => {
    if (update.balance !== undefined) {
      setBalance(update.balance);
    }
    if (update.positionSize !== undefined) {
      setPositionSize(update.positionSize);
    }

    if (update.realizedPnl !== undefined) {
      setTotalRealizedPnl((prev) => prev + update.realizedPnl);
    }

    if (update.xpDelta) {
      setXp((prevXp) => {
        const nextXp = prevXp + update.xpDelta;
        setLevel((prevLevel) => {
          const nextLevel = checkLevelUp(nextXp, prevLevel);
          if (nextLevel !== prevLevel) {
            Alert.alert('Tebrikler, Yeni Seviye!', `Yeni seviyen: Seviye ${nextLevel}`);
          }
          return nextLevel;
        });
        return nextXp;
      });
    }

    if (update.portfolioValue !== undefined) {
      checkGameOver(update.portfolioValue);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>FinRoute</Text>
          <Text style={styles.subtitle}>Ezbere işlem yapmayı bırak. Kendi rotanı çiz.</Text>
        </View>
        <View style={styles.levelBadge}>
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>Lv. {level}</Text>
            <Text style={styles.xpText}>{xp.toFixed(0)} XP</Text>
          </View>
          <View style={styles.xpBarBackground}>
            <View style={[styles.xpBarFill, { width: `${Math.min(100, (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100)}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TabButton label="Dashboard" isActive={activeScreen === 'dashboard'} onPress={() => setActiveScreen('dashboard')} />
        <TabButton label="Simülasyon" isActive={activeScreen === 'simulation'} onPress={() => setActiveScreen('simulation')} />
      </View>

      <View style={styles.content}>
        {activeScreen === 'dashboard' ? (
          <DashboardScreen portfolio={portfolio} />
        ) : (
          <SimulationScreen portfolio={portfolio} onPortfolioChange={handlePortfolioUpdate} />
        )}
      </View>
    </SafeAreaView>
  );
}

function TabButton({ label, isActive, onPress }) {
  return (
    <TouchableOpacity style={[styles.tabButton, isActive && styles.tabButtonActive]} onPress={onPress}>
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  levelBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    minWidth: 110,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  xpText: {
    color: theme.colors.textSoft,
    fontSize: 11,
  },
  xpBarBackground: {
    marginTop: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(31, 41, 55, 1)',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: theme.colors.accent,
  },
  tabButtonText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#0f172a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

