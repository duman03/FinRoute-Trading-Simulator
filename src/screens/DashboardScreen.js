import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../utils/theme';
import { calculatePortfolioValue } from '../utils/tradingEngine';
import { StatCard } from '../components/StatCard';
import { MissionCard } from '../components/MissionCard';

export function DashboardScreen({ portfolio, onReset }) {
  const { balance, positionsByAsset = {}, pricesByAsset = {}, level, xp = 0, totalRealizedPnl = 0 } = portfolio;
  const portfolioValue = calculatePortfolioValue({
    balance,
    positionsByAsset,
    pricesByAsset,
  });

  const unrealizedPnl = portfolioValue - 100000;
  const pnlPercent = (unrealizedPnl / 100000) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>FinRoute Dashboard</Text>
        <Text style={styles.heroSubtitle}>Teknik analiz yolculuğuna hazır mısın?</Text>
      </View>

      <View style={styles.row}>
        <StatCard
          label="Sanal Bakiye"
          value={balance.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' ₺'}
          accent="primary"
        />
        <StatCard
          label="Toplam Portföy"
          value={portfolioValue.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' ₺'}
          accent="secondary"
        />
      </View>

      <View style={styles.row}>
        <StatCard label="Seviye" value={`Lv. ${level}`} />
        <StatCard
          label="Gerçekleşmemiş PnL"
          value={`${unrealizedPnl >= 0 ? '+' : ''}${unrealizedPnl.toFixed(2)} ₺ (${pnlPercent.toFixed(2)}%)`}
          accent={unrealizedPnl >= 0 ? 'primary' : 'danger'}
        />
      </View>

      <View style={styles.row}>
        <StatCard label="XP" value={`${xp.toFixed(0)} XP`} accent="primary" />
        <StatCard
          label="Gerçekleşen PnL"
          value={`${totalRealizedPnl >= 0 ? '+' : ''}${totalRealizedPnl.toFixed(2)} ₺`}
          accent={totalRealizedPnl >= 0 ? 'primary' : 'danger'}
        />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Motto</Text>
        <Text style={styles.infoText}>Ezbere işlem yapmayı bırak. Kendi rotanı çiz.</Text>
        <Text style={styles.infoHint}>Grafik ekranına geçerek canlı simülasyonla pratik yap.</Text>
      </View>

      <View style={styles.missionsBlock}>
        <Text style={styles.missionsTitle}>Bugünün Görevleri</Text>
        <MissionCard
          title="Kârlı İşlem Yap"
          description="En az bir işlemi pozitif PnL ile kapat."
          completed={totalRealizedPnl > 0}
        />
        <MissionCard
          title="Seviye 2'ye Ulaş"
          description="Toplam XP biriktirerek Seviye 2 ol."
          completed={level >= 2}
        />
        <MissionCard
          title="500 XP Topla"
          description="XP çubuğunu yarıdan fazlasına getir."
          completed={xp >= 500}
        />
      </View>

      {onReset && (
        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <Text style={styles.resetText}>Hesabı Sıfırla</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 4,
    gap: 16,
  },
  heroCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  heroSubtitle: {
    marginTop: 6,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.cardSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  infoTitle: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoText: {
    marginTop: 6,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  infoHint: {
    marginTop: 10,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  missionsBlock: {
    marginTop: 4,
  },
  missionsTitle: {
    fontSize: 12,
    color: theme.colors.textSoft,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  resetButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  resetText: {
    fontSize: 12,
    color: theme.colors.textSoft,
  },
});

