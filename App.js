import React, { useState, useMemo, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StatusBar, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SimulationScreen } from './src/screens/SimulationScreen';
import { AcademyScreen } from './src/screens/AcademyScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { theme } from './src/utils/theme';

const INITIAL_BALANCE = 100000; 
const XP_PER_LEVEL = 1000;
const STORAGE_KEY = 'finroute:portfolio';
const INITIAL_POSITIONS = { BCoin: 0, TechCorp: 0, SafeGold: 0 };
const INITIAL_PRICES = { BCoin: 100, TechCorp: 80, SafeGold: 60 };
const RESCUE_THRESHOLD = INITIAL_BALANCE * 0.05;
const HEARTS_COOLDOWN_MS = 5 * 60 * 1000;

export default function App() {
  const [activeTab, setActiveTab] = useState('academy');
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [positionsByAsset, setPositionsByAsset] = useState(INITIAL_POSITIONS);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [totalRealizedPnl, setTotalRealizedPnl] = useState(0);
  const [pricesByAsset, setPricesByAsset] = useState(INITIAL_PRICES);
  const [showProModal, setShowProModal] = useState(false);
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [rescueLoading, setRescueLoading] = useState(false);
  const [hasUsedRescue, setHasUsedRescue] = useState(false);
  const [academyProgress, setAcademyProgress] = useState({
    lesson1Completed: false,
    lesson2Unlocked: false,
    lesson2Completed: false,
    lesson3Unlocked: false,
    lesson3Completed: false, // Yeni: Ders 3 tamamlama durumu
  });
  const [heartsState, setHeartsState] = useState({
    count: 5,
    depletedAtMs: null,
  });

  const portfolio = useMemo(
    () => ({
      balance,
      positionsByAsset,
      level,
      xp,
      totalRealizedPnl,
      pricesByAsset,
    }),
    [balance, positionsByAsset, level, xp, totalRealizedPnl, pricesByAsset]
  );

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored);
        if (typeof parsed.balance === 'number') setBalance(parsed.balance);
        if (parsed.positionsByAsset && typeof parsed.positionsByAsset === 'object') {
          setPositionsByAsset({ ...INITIAL_POSITIONS, ...parsed.positionsByAsset });
        }
        if (typeof parsed.level === 'number') setLevel(parsed.level);
        if (typeof parsed.xp === 'number') setXp(parsed.xp);
        if (typeof parsed.totalRealizedPnl === 'number') setTotalRealizedPnl(parsed.totalRealizedPnl);
        if (parsed.pricesByAsset && typeof parsed.pricesByAsset === 'object') {
          setPricesByAsset((prev) => ({ ...prev, ...parsed.pricesByAsset }));
        }
        if (parsed.academyProgress && typeof parsed.academyProgress === 'object') {
          setAcademyProgress((prev) => ({ ...prev, ...parsed.academyProgress }));
        }
        if (parsed.heartsState && typeof parsed.heartsState === 'object') {
          const nextCount = typeof parsed.heartsState.count === 'number' ? parsed.heartsState.count : 5;
          const nextDepletedAtMs = typeof parsed.heartsState.depletedAtMs === 'number' ? parsed.heartsState.depletedAtMs : null;

          if (nextCount <= 0 && nextDepletedAtMs && Date.now() - nextDepletedAtMs >= HEARTS_COOLDOWN_MS) {
            setHeartsState({ count: 5, depletedAtMs: null });
          } else {
            setHeartsState({
              count: Math.max(0, Math.min(5, nextCount)),
              depletedAtMs: nextDepletedAtMs,
            });
          }
        }
      } catch (e) {
        console.warn('Portföy yüklenirken hata oluştu', e);
      }
    };
    loadPortfolio();
  }, []);

  useEffect(() => {
    const savePortfolio = async () => {
      try {
        const snapshot = {
          balance, positionsByAsset, level, xp, totalRealizedPnl,
          pricesByAsset, academyProgress, heartsState,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch (e) {
        console.warn('Portföy kaydedilirken hata oluştu', e);
      }
    };
    savePortfolio();
  }, [balance, positionsByAsset, level, xp, totalRealizedPnl, pricesByAsset, academyProgress, heartsState]);

  const resetGame = () => {
    setBalance(INITIAL_BALANCE);
    setPositionsByAsset(INITIAL_POSITIONS);
    setLevel(1);
    setXp(0);
    setTotalRealizedPnl(0);
    setPricesByAsset(INITIAL_PRICES);
    setAcademyProgress({
        lesson1Completed: false,
        lesson2Unlocked: false,
        lesson2Completed: false,
        lesson3Unlocked: false,
        lesson3Completed: false,
    });
    setHeartsState({ count: 5, depletedAtMs: null });
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  const checkLevelUp = (nextXp, currentLevel) => {
    const targetLevel = Math.max(1, Math.floor(nextXp / XP_PER_LEVEL) + 1);
    return targetLevel > currentLevel ? targetLevel : currentLevel;
  };

  const handlePortfolioUpdate = (update) => {
    if (update.balance !== undefined) setBalance(update.balance);
    if (update.positionsByAsset !== undefined) setPositionsByAsset(update.positionsByAsset);
    if (update.realizedPnl !== undefined) setTotalRealizedPnl((prev) => prev + update.realizedPnl);

    if (update.xpDelta) {
      setXp((prevXp) => {
        const nextXp = prevXp + update.xpDelta;
        setLevel((prevLevel) => {
          const nextLevel = checkLevelUp(nextXp, prevLevel);
          if (nextLevel !== prevLevel) Alert.alert('Tebrikler, Yeni Seviye!', `Yeni seviyen: Seviye ${nextLevel}`);
          return nextLevel;
        });
        return nextXp;
      });
    }

    if (update.portfolioValue !== undefined) {
      const value = update.portfolioValue;
      if (value <= RESCUE_THRESHOLD && !hasUsedRescue && !showRescueModal) {
        setShowRescueModal(true);
        return;
      }
      if (value <= INITIAL_BALANCE * 0.1) {
        Alert.alert('İflas Ettin!', 'Oyun başlangıç noktasına sıfırlandı.', [{ text: 'Yeniden Başla', onPress: resetGame }]);
      }
    }
  };

  const handlePricesChange = (nextPrices) => setPricesByAsset((prev) => ({ ...prev, ...nextPrices }));

  // DERS TAMAMLAMA FONKSİYONLARI
  const handleCompleteLesson1 = () => {
    setAcademyProgress(prev => ({ ...prev, lesson1Completed: true, lesson2Unlocked: true }));
    handlePortfolioUpdate({ xpDelta: 100 });
  };

  const handleCompleteLesson2 = () => {
    setAcademyProgress(prev => ({ ...prev, lesson2Completed: true, lesson3Unlocked: true }));
    handlePortfolioUpdate({ xpDelta: 150 });
  };

  const handleCompleteLesson3 = () => {
    // 1. Akademi durumunu güncelle
    setAcademyProgress(prev => ({ ...prev, lesson3Completed: true }));
    
    // 2. Mezuniyet XP'sini ver
    handlePortfolioUpdate({ xpDelta: 500 });
    
    // 3. Kullanıcıya tebrik mesajı göster ve mesaj kapanınca Piyasaya Işınla
    Alert.alert(
      '🎓 Akademi Mezunu!',
      'Tebrikler, Akademiyi Bitirdin! Artık canlı piyasada işlem yapmaya hazırsın.',
      [
        { 
          text: 'Piyasaya Git', 
          onPress: () => setActiveTab('trade') // İşte bu satır seni canlı grafiğe götürecek!
        }
      ]
    );
  };

  const handleConsumeHeart = (nextCount) => {
    setHeartsState(prev => ({
      count: Math.max(0, nextCount),
      depletedAtMs: nextCount <= 0 ? Date.now() : prev.depletedAtMs
    }));
  };

  const handleRestoreHearts = () => setHeartsState({ count: 5, depletedAtMs: null });

  const handleSelectTab = (tabKey) => {
    if (tabKey === 'trade' && level < 3) {
      Alert.alert('Pro Alan Kilitli', 'Serbest İşlem ekranı Seviye 3 ve üzeri oyuncular için açılır.');
      return;
    }
    setActiveTab(tabKey);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>FinRoute</Text>
          <Text style={styles.subtitle}>Finansın Duolingo'su: Oyna, öğren, ustalaş.</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.proButton} onPress={() => setShowProModal(true)}>
            <Text style={styles.proButtonText}>PRO'ya Geç</Text>
          </TouchableOpacity>
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
      </View>

      <View style={styles.content}>
        {activeTab === 'academy' && (
          <AcademyScreen
            portfolio={portfolio}
            academyProgress={academyProgress}
            onCompleteLesson1={handleCompleteLesson1}
            onCompleteLesson2={handleCompleteLesson2}
            onCompleteLesson3={handleCompleteLesson3} // Yeni eklendi
            heartsState={heartsState}
            onConsumeHeart={handleConsumeHeart}
            onRestoreHearts={handleRestoreHearts}
          />
        )}
        {activeTab === 'trade' && (
          <SimulationScreen
            portfolio={portfolio}
            onPortfolioChange={handlePortfolioUpdate}
            onPricesChange={handlePricesChange}
          />
        )}
        {activeTab === 'profile' && <ProfileScreen portfolio={portfolio} onReset={resetGame} />}
      </View>

      <View style={styles.bottomTabBar}>
        <BottomTabButton label="Akademi" icon="🎓" isActive={activeTab === 'academy'} onPress={() => handleSelectTab('academy')} />
        <BottomTabButton label="Serbest İşlem" icon="⚡" isActive={activeTab === 'trade'} onPress={() => handleSelectTab('trade')} badge={level < 3 ? 'Lv3' : 'PRO'} />
        <BottomTabButton label="Profil" icon="👤" isActive={activeTab === 'profile'} onPress={() => handleSelectTab('profile')} />
      </View>

      {/* MODALLAR (PRO ve Rescue) */}
      <Modal visible={showProModal} transparent animationType="fade" onRequestClose={() => setShowProModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>FinRoute PRO</Text>
            <Text style={styles.modalSubtitle}>PRO Ayrıcalıkları</Text>
            <View style={styles.modalList}>
              <Text style={styles.modalItem}>• İleri düzey mum formasyonları</Text>
              <Text style={styles.modalItem}>• Sınırsız al-sat analizi</Text>
              <Text style={styles.modalItem}>• Reklamsız deneyim</Text>
            </View>
            <TouchableOpacity style={styles.modalPrimaryButton} onPress={() => Alert.alert('Yakında', 'PRO özellikleri yakında!')}>
              <Text style={styles.modalPrimaryText}>Aylık 49,99 ₺ ile Başla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => setShowProModal(false)}>
              <Text style={styles.modalSecondaryText}>Daha Sonra</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showRescueModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Kritik Seviye</Text>
            <Text style={styles.modalSubtitle}>İflasın eşiğindesin!</Text>
            {rescueLoading ? (
              <View style={styles.loadingRow}><ActivityIndicator color="#facc15" /><Text style={styles.loadingText}>Reklam oynatılıyor...</Text></View>
            ) : (
              <TouchableOpacity style={styles.modalPrimaryButton} onPress={() => {
                setRescueLoading(true);
                setTimeout(() => {
                  setRescueLoading(false); setShowRescueModal(false); setHasUsedRescue(true);
                  setBalance(prev => prev + 50000); Alert.alert('Tebrikler', '50.000 ₺ eklendi.');
                }, 2000);
              }}>
                <Text style={styles.modalPrimaryText}>Reklam İzle ve Kurtar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function BottomTabButton({ label, icon, isActive, onPress, badge }) {
  return (
    <TouchableOpacity style={[styles.bottomTabButton, isActive && styles.bottomTabButtonActive]} onPress={onPress}>
      <View style={styles.bottomTabIconRow}>
        <Text style={styles.bottomTabIcon}>{icon}</Text>
        {badge && <View style={styles.bottomTabBadge}><Text style={styles.bottomTabBadgeText}>{badge}</Text></View>}
      </View>
      <Text style={[styles.bottomTabLabel, isActive && styles.bottomTabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.borderSubtle, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoText: { fontSize: 24, fontWeight: '700', color: theme.colors.textPrimary },
  subtitle: { marginTop: 4, color: theme.colors.textMuted, fontSize: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  proButton: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#facc15' },
  proButtonText: { fontSize: 11, fontWeight: '700', color: '#0f172a' },
  levelBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#020617', borderWidth: 1, borderColor: theme.colors.borderSubtle, minWidth: 110 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelText: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: '600' },
  xpText: { color: theme.colors.textSoft, fontSize: 11 },
  xpBarBackground: { marginTop: 4, height: 4, borderRadius: 999, backgroundColor: 'rgba(31, 41, 55, 1)', overflow: 'hidden' },
  xpBarFill: { height: 4, borderRadius: 999, backgroundColor: theme.colors.accent },
  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 8 },
  bottomTabBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: theme.colors.surfaceElevated, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.borderSubtle },
  bottomTabButton: { flex: 1, paddingVertical: 6, marginHorizontal: 4, borderRadius: 999, backgroundColor: theme.colors.cardSoft, alignItems: 'center', justifyContent: 'center' },
  bottomTabButtonActive: { backgroundColor: theme.colors.accentSoft },
  bottomTabIconRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  bottomTabIcon: { fontSize: 16 },
  bottomTabLabel: { marginTop: 2, fontSize: 11, color: theme.colors.textSoft, fontWeight: '500' },
  bottomTabLabelActive: { color: theme.colors.textPrimary },
  bottomTabBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, backgroundColor: '#f97316' },
  bottomTabBadgeText: { fontSize: 9, fontWeight: '700', color: '#0b1120' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalCard: { width: '100%', borderRadius: 20, padding: 18, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: 'rgba(250, 204, 21, 0.5)' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#facc15' },
  modalSubtitle: { marginTop: 4, fontSize: 13, color: theme.colors.textPrimary },
  modalList: { marginTop: 10, marginBottom: 10, gap: 4 },
  modalItem: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
  modalPrimaryButton: { marginTop: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: '#facc15', alignItems: 'center' },
  modalPrimaryText: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  modalSecondaryButton: { marginTop: 8, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.borderSubtle, alignItems: 'center' },
  modalSecondaryText: { fontSize: 12, color: theme.colors.textSoft },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  loadingText: { fontSize: 12, color: theme.colors.textMuted },
});