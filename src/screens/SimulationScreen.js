import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../utils/theme';
import { INITIAL_PRICE, generateNextCandle, getRandomTip } from '../utils/mockData';
import { detectCandlestickPattern } from '../utils/patterns';
import { PriceChart } from '../components/PriceChart';
import { InfoCard } from '../components/InfoCard';
import { TradePanel } from '../components/TradePanel';

export function SimulationScreen({ portfolio, onPortfolioChange }) {
  const [candles, setCandles] = useState([
    {
      open: INITIAL_PRICE,
      high: INITIAL_PRICE,
      low: INITIAL_PRICE,
      close: INITIAL_PRICE,
    },
  ]);
  const [tip, setTip] = useState(getRandomTip());
  const [activePattern, setActivePattern] = useState(null);
  const patternTimeoutRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const next = generateNextCandle(last?.close ?? INITIAL_PRICE);
        const updated = [...prev, next];
        // sadece son 20 mum verisini tut
        if (updated.length > 20) {
          updated.shift();
        }
        return updated;
      });

      if (Math.random() > 0.6) {
        setTip(getRandomTip());
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pattern = detectCandlestickPattern(candles);
    if (pattern) {
      setActivePattern(pattern);
      if (patternTimeoutRef.current) {
        clearTimeout(patternTimeoutRef.current);
      }
      patternTimeoutRef.current = setTimeout(() => {
        setActivePattern(null);
      }, 4000);
    }
  }, [candles]);

  useEffect(() => {
    return () => {
      if (patternTimeoutRef.current) {
        clearTimeout(patternTimeoutRef.current);
      }
    };
  }, []);

  const currentCandle = candles[candles.length - 1];
  const currentPrice = currentCandle?.close ?? INITIAL_PRICE;
  const highlightMessage = activePattern?.message ?? null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PriceChart candles={candles} />
      <View style={styles.spacer} />
      <InfoCard tip={tip} highlight={highlightMessage} />
      <TradePanel
        portfolio={portfolio}
        currentPrice={currentPrice}
        onPortfolioChange={onPortfolioChange}
        activePattern={activePattern}
      />
      <View style={{ height: 12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
  },
  spacer: {
    height: 12,
  },
});

