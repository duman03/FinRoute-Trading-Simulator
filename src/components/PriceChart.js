import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

export function PriceChart({ candles, isLive = false, isQuizMode = false, currencySymbol = '₺' }) {
  if (!candles || candles.length === 0) {
    return null;
  }

  const lows = candles.map((c) => c.low);
  const highs = candles.map((c) => c.high);
  const minLow = Math.min(...lows);
  const maxHigh = Math.max(...highs);
  // Fiyat aralığını bul (Sıfıra bölünmeyi önlemek için minimum 1)
  const range = maxHigh - minLow || 1; 

  const lastCandle = candles[candles.length - 1];
  const firstCandle = candles[0];
  const lastPrice = lastCandle.close;
  const firstPrice = firstCandle.open;
  const change = lastPrice - firstPrice;
  const changePercent = (change / firstPrice) * 100;

  // Grafiğin maksimum yüksekliği
  const CHART_HEIGHT = isQuizMode ? 140 : 200;

  return (
    <View style={[styles.container, isQuizMode && styles.quizContainer]}>
      
      {/* Quiz modunda fiyat yazılarını gizleyerek dikkati dağıtmayız */}
      {!isQuizMode && (
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.price}>
              {lastPrice.toFixed(2)} {currencySymbol}
            </Text>
            <Text style={styles.change(change >= 0)}>
              {`${change >= 0 ? '+' : ''}${change.toFixed(2)} ${currencySymbol} (${changePercent.toFixed(2)}%)`}
            </Text>
          </View>
          <Text style={isLive ? styles.liveLabel : styles.label}>
            {isLive ? '🟢 Canlı Veri' : 'Mock Grafik'}
          </Text>
        </View>
      )}

      {/* Dinamik Grafik Alanı */}
      <View style={[styles.chartArea, { height: CHART_HEIGHT }]}>
        {candles.map((candle, index) => {
          const isBull = candle.close >= candle.open;
          const color = isBull ? '#22c55e' : '#ef4444'; // Yeşil ve Kırmızı

          // Matematiksel Ölçeklendirme (Değerleri piksellere çevirme)
          const scale = CHART_HEIGHT / range;
          
          const wickHeight = Math.max(1, (candle.high - candle.low) * scale);
          const wickBottom = (candle.low - minLow) * scale;

          const bottomPrice = Math.min(candle.open, candle.close);
          const bodyHeight = Math.max(4, Math.abs(candle.open - candle.close) * scale);
          const bodyBottom = (bottomPrice - minLow) * scale;

          return (
            <View key={index.toString()} style={styles.candleWrapper}>
              {/* Fitil */}
              <View style={[styles.wick, { height: wickHeight, bottom: wickBottom, backgroundColor: color }]} />
              {/* Gövde */}
              <View style={[styles.body, { height: bodyHeight, bottom: bodyBottom, backgroundColor: color }]} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  quizContainer: {
    padding: 8,
    marginVertical: 10,
    backgroundColor: '#0f172a', // Koyu havalı arka plan
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  price: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  change: (positive) => ({
    marginTop: 4,
    fontSize: 12,
    color: positive ? '#22c55e' : '#ef4444',
  }),
  label: {
    fontSize: 11,
    color: theme.colors.textSoft,
  },
  liveLabel: {
    fontSize: 11,
    color: '#22c55e',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around', // Mumları eşit dağıt
    width: '100%',
  },
  candleWrapper: {
    width: 14, // Mumlar arası mesafe
    height: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  wick: {
    width: 2,
    position: 'absolute',
    borderRadius: 999,
  },
  body: {
    position: 'absolute',
    width: 10,
    borderRadius: 3,
  },
});