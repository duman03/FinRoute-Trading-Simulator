import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '../utils/theme';
import { calculatePortfolioValue, executeBuyAsset, executeSellAsset } from '../utils/tradingEngine';

export function TradePanel({
  portfolio,
  currentPrice,
  currentAssetKey,
  onPortfolioChange,
  activePattern,
  currencySymbol = '₺',
}) {
  const { balance, positionsByAsset = {}, pricesByAsset = {}, level, xp, totalRealizedPnl } = portfolio;
  const [buyAmount, setBuyAmount] = useState('1000');
  const [sellPercent, setSellPercent] = useState('25');
  const [recentXpGain, setRecentXpGain] = useState(0);
  const [recentXpLabel, setRecentXpLabel] = useState('');
  const [showXpToast, setShowXpToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  const portfolioValue = calculatePortfolioValue({ balance, positionsByAsset, pricesByAsset });
  const currentPositionQty = positionsByAsset[currentAssetKey] ?? 0;

  const handleBuy = () => {
    const amount = Number(buyAmount);
    const result = executeBuyAsset({
      balance,
      positionsByAsset,
      assetKey: currentAssetKey,
      currentPrice,
      amountToInvest: amount,
    });

    const newPortfolioValue = calculatePortfolioValue({
      balance: result.balance,
      positionsByAsset: result.positionsByAsset,
      pricesByAsset,
    });

    let bonusXp = 0;
    if (activePattern?.type === 'bullish_engulfing') {
      bonusXp = 50;
      setRecentXpGain(bonusXp);
      setRecentXpLabel('🎯 Formasyon Avcısı! +50 XP');
      setShowXpToast(true);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setShowXpToast(false);
      }, 1800);
    }

    const update = {
      balance: result.balance,
      positionsByAsset: result.positionsByAsset,
      portfolioValue: newPortfolioValue,
    };
    if (bonusXp > 0) {
      update.xpDelta = bonusXp;
    }

    onPortfolioChange(update);
  };

  const handleSell = () => {
    const pct = Number(sellPercent) / 100;
    const portfolioValueBefore = portfolioValue;
    const result = executeSellAsset({
      balance,
      positionsByAsset,
      assetKey: currentAssetKey,
      currentPrice,
      percentageToSell: pct,
    });
    const newPortfolioValue = calculatePortfolioValue({
      balance: result.balance,
      positionsByAsset: result.positionsByAsset,
      pricesByAsset,
    });
    const realizedPnl = newPortfolioValue - portfolioValueBefore;
    const xpDelta = realizedPnl > 0 ? Math.floor(realizedPnl / 10) : 0;

    if (xpDelta > 0) {
      setRecentXpGain(xpDelta);
      setRecentXpLabel(`+${xpDelta} XP`);
      setShowXpToast(true);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setShowXpToast(false);
      }, 1800);
    }

    onPortfolioChange({
      balance: result.balance,
      positionsByAsset: result.positionsByAsset,
      realizedPnl,
      xpDelta,
      portfolioValue: newPortfolioValue,
    });
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Serbest Bakiye</Text>
          <Text style={styles.metricValue}>
            {balance.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} {currencySymbol}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Açık Pozisyon</Text>
          <Text style={styles.metricValue}>
            {currentPositionQty.toFixed(4)} lot /{' '}
            {Math.round(currentPositionQty * currentPrice).toLocaleString('tr-TR')} {currencySymbol}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Anlık Fiyat</Text>
          <Text style={styles.metricValue}>
            {currentPrice.toFixed(2)} {currencySymbol}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Portföy Değeri</Text>
          <Text style={styles.metricValue}>
            {portfolioValue.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} {currencySymbol}
          </Text>
        </View>
      </View>

      <View style={styles.rowActions}>
        <View style={styles.actionBlock}>
          <Text style={styles.actionLabel}>Alım Tutarı ({currencySymbol})</Text>
          <TextInput
            value={buyAmount}
            onChangeText={setBuyAmount}
            placeholder="1000"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={theme.colors.textSoft}
          />
          <TouchableOpacity style={[styles.button, styles.buyButton]} onPress={handleBuy}>
            <Text style={styles.buttonText}>Al</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionBlock}>
          <Text style={styles.actionLabel}>Satış Oranı (%)</Text>
          <TextInput
            value={sellPercent}
            onChangeText={setSellPercent}
            placeholder="25"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={theme.colors.textSoft}
          />
          <TouchableOpacity style={[styles.button, styles.sellButton]} onPress={handleSell}>
            <Text style={styles.buttonText}>Sat</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showXpToast && (
        <View style={styles.xpToast}>
          <Text style={styles.xpToastText}>{recentXpLabel || `+${recentXpGain} XP`}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: theme.colors.textSoft,
  },
  metricValue: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  actionBlock: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 11,
    color: theme.colors.textSoft,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: theme.colors.textPrimary,
    fontSize: 13,
    backgroundColor: theme.colors.surface,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: theme.colors.accent,
  },
  sellButton: {
    backgroundColor: theme.colors.accentSecondary,
  },
  buttonText: {
    color: '#0b1120',
    fontSize: 13,
    fontWeight: '600',
  },
  xpToast: {
    position: 'absolute',
    right: 16,
    top: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  xpToastText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
});

