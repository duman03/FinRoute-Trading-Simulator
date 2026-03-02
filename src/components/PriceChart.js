import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

// candles: { open, high, low, close } dizisi
export function PriceChart({ candles }) {
  if (!candles || candles.length === 0) {
    return null;
  }

  const lows = candles.map((c) => c.low);
  const highs = candles.map((c) => c.high);
  const minLow = Math.min(...lows);
  const maxHigh = Math.max(...highs);
  const range = maxHigh - minLow || 1;

  const lastCandle = candles[candles.length - 1];
  const firstCandle = candles[0];
  const lastPrice = lastCandle.close;
  const firstPrice = firstCandle.open;
  const change = lastPrice - firstPrice;
  const changePercent = (change / firstPrice) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.price}>{lastPrice.toFixed(2)} ₺</Text>
          <Text style={styles.change(change >= 0)}>{`${change >= 0 ? '+' : ''}${change.toFixed(
            2
          )} ₺ (${changePercent.toFixed(2)}%)`}</Text>
        </View>
        <Text style={styles.label}>Mock Fiyat Grafiği</Text>
      </View>

      <View style={styles.chartArea}>
        {candles.map((candle, index) => {
          const isBull = candle.close >= candle.open;
          const color = isBull ? '#00b894' : '#d63031';

          const candleRange = candle.high - candle.low || range * 0.05;
          const bodyRange = Math.max(Math.abs(candle.close - candle.open), range * 0.01);

          const wickHeight = Math.max(4, (candleRange / range) * 180);
          const bodyHeight = Math.max(6, (bodyRange / range) * 180);

          return (
            <View key={index.toString()} style={styles.candleWrapper}>
              <View style={[styles.wick, { height: wickHeight, backgroundColor: color }]} />
              <View style={[styles.body, { height: bodyHeight, backgroundColor: color }]} />
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
    color: positive ? theme.colors.accent : theme.colors.danger,
  }),
  label: {
    fontSize: 11,
    color: theme.colors.textSoft,
  },
  chartArea: {
    height: 200,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  candleWrapper: {
    height: 200,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  wick: {
    width: 2,
    borderRadius: 999,
  },
  body: {
    position: 'absolute',
    bottom: 0,
    width: 10,
    borderRadius: 3,
  },
});

