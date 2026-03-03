import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { theme } from '../utils/theme';
import { INITIAL_PRICE, ASSET_KEYS, ASSETS, generateNextCandle, getRandomTip } from '../utils/mockData';
import { detectCandlestickPattern } from '../utils/patterns';
import { PriceChart } from '../components/PriceChart';
import { InfoCard } from '../components/InfoCard';
import { TradePanel } from '../components/TradePanel';

export function SimulationScreen({ portfolio, onPortfolioChange, onPricesChange }) {
  const [activeAsset, setActiveAsset] = useState('BCoin');
  const [candlesByAsset, setCandlesByAsset] = useState(() => {
    const initial = {};
    ASSETS.forEach((asset) => {
      const base = asset.basePrice ?? INITIAL_PRICE;
      initial[asset.key] = [
        {
          open: base,
          high: base,
          low: base,
          close: base,
        },
      ];
    });
    return initial;
  });
  const [tip, setTip] = useState(getRandomTip());
  const [activePattern, setActivePattern] = useState(null);
  const patternTimeoutRef = useRef(null);
  const wsRef = useRef(null);

  const normalizePrice = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(num)) {
      return NaN;
    }
    return Number(num.toFixed(2));
  };

  // Mock veri motoru: TechCorp ve SafeGold için çalışmaya devam eder.
  // B-Coin için mumlar Binance WebSocket'ten güncellenir.
  useEffect(() => {
    const interval = setInterval(() => {
      setCandlesByAsset((prev) => {
        const nextState = { ...prev };
        const latestPrices = {};

        ASSET_KEYS.forEach((key) => {
          const list = nextState[key] ?? [];
          const last = list[list.length - 1];

          if (key === 'BCoin') {
            if (last) {
              latestPrices[key] = last.close;
            }
            return;
          }

          const next = generateNextCandle(key, last?.close ?? INITIAL_PRICE);
          const updated = [...list, next];
          if (updated.length > 20) {
            updated.shift();
          }
          nextState[key] = updated;
          latestPrices[key] = next.close;
        });

        if (onPricesChange) {
          try {
            onPricesChange(latestPrices);
          } catch (error) {
            console.warn('Fiyat güncellemesi uygulanırken hata oluştu', error);
          }
        }

        return nextState;
      });

      if (Math.random() > 0.6) {
        setTip(getRandomTip());
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [onPricesChange]);

  // B-Coin sekmesi aktifleştirildiğinde Binance WebSocket bağlanır,
  // sekme değiştiğinde veya component unmount olduğunda bağlantı temizlenir.
  useEffect(() => {
    if (activeAsset !== 'BCoin') {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (error) {
          console.warn('Binance WebSocket kapatılırken hata oluştu', error);
        }
        wsRef.current = null;
      }
      return;
    }

    let socket;
    try {
      socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
      wsRef.current = socket;
    } catch (error) {
      console.warn('Binance WebSocket oluşturulurken hata oluştu', error);
      return undefined;
    }

    socket.onopen = () => {
      console.log('Binance WebSocket bağlantısı açıldı');
    };

    socket.onerror = (event) => {
      console.warn('Binance WebSocket hata verdi', event?.message ?? event);
    };

    socket.onclose = (event) => {
      console.log('Binance WebSocket bağlantısı kapandı', event?.code, event?.reason);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const kline = data?.k;
        if (!kline) {
          return;
        }

        // Sadece BTCUSDT için işlem yap
        if (kline.s && kline.s !== 'BTCUSDT') {
          return;
        }

        const open = normalizePrice(kline.o);
        const high = normalizePrice(kline.h);
        const low = normalizePrice(kline.l);
        const close = normalizePrice(kline.c);

        if (
          Number.isNaN(open) ||
          Number.isNaN(high) ||
          Number.isNaN(low) ||
          Number.isNaN(close)
        ) {
          return;
        }

        // Kapanmamış mumda mevcut son mumu canlı fiyatla güncelle
        if (!kline.x) {
          setCandlesByAsset((prev) => {
            const prevListRaw = prev.BCoin ?? [];

            // Sadece mock seed varsa onu at ve gerçek veriden başla
            const isOnlyMockSeed =
              prevListRaw.length === 1 &&
              prevListRaw[0].open === INITIAL_PRICE &&
              prevListRaw[0].high === INITIAL_PRICE &&
              prevListRaw[0].low === INITIAL_PRICE &&
              prevListRaw[0].close === INITIAL_PRICE;

            const prevList = isOnlyMockSeed ? [] : prevListRaw;

            let nextList;
            if (prevList.length === 0) {
              nextList = [
                {
                  open,
                  high,
                  low,
                  close,
                },
              ];
            } else {
              const last = prevList[prevList.length - 1];
              const updatedLast = {
                ...last,
                high: Math.max(last.high, high),
                low: Math.min(last.low, low),
                close,
              };

              nextList = [...prevList.slice(0, -1), updatedLast];
            }

            if (nextList.length > 60) {
              nextList = nextList.slice(nextList.length - 60);
            }

            if (onPricesChange) {
              try {
                onPricesChange({ BCoin: close });
              } catch (error) {
                console.warn('Fiyat güncellemesi uygulanırken hata oluştu', error);
              }
            }

            return {
              ...prev,
              BCoin: nextList,
            };
          });

          return;
        }

        setCandlesByAsset((prev) => {
          const prevList = prev.BCoin ?? [];

          // İlk sentetik mock mumu (100 tabanlı) yerine gerçek veriye geçiş
          const isOnlyMockSeed =
            prevList.length === 1 &&
            prevList[0].open === INITIAL_PRICE &&
            prevList[0].high === INITIAL_PRICE &&
            prevList[0].low === INITIAL_PRICE &&
            prevList[0].close === INITIAL_PRICE;

          const baseList = isOnlyMockSeed ? [] : prevList;
          const trimmed =
            baseList.length >= 60 ? baseList.slice(baseList.length - 59) : baseList;

          const nextCandle = {
            open,
            high,
            low,
            close,
          };

          const nextList = [...trimmed, nextCandle];

          if (onPricesChange) {
            try {
              onPricesChange({ BCoin: close });
            } catch (error) {
              console.warn('Fiyat güncellemesi uygulanırken hata oluştu', error);
            }
          }

          return {
            ...prev,
            BCoin: nextList,
          };
        });
      } catch (error) {
        console.warn('Binance WebSocket mesajı işlenirken hata oluştu', error);
      }
    };

    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (error) {
          console.warn('Binance WebSocket kapatılırken hata oluştu', error);
        }
        wsRef.current = null;
      }
    };
  }, [activeAsset, onPricesChange]);

  useEffect(() => {
    const activeCandles = candlesByAsset[activeAsset];
    if (!Array.isArray(activeCandles) || activeCandles.length === 0) {
      setActivePattern(null);
      return;
    }

    const pattern = detectCandlestickPattern(activeCandles);
    if (pattern) {
      setActivePattern(pattern);
      if (patternTimeoutRef.current) {
        clearTimeout(patternTimeoutRef.current);
      }
      patternTimeoutRef.current = setTimeout(() => {
        setActivePattern(null);
      }, 4000);
    } else {
      setActivePattern(null);
    }
  }, [candlesByAsset, activeAsset]);

  useEffect(() => {
    return () => {
      if (patternTimeoutRef.current) {
        clearTimeout(patternTimeoutRef.current);
      }
    };
  }, []);

  const activeCandles = Array.isArray(candlesByAsset[activeAsset]) ? candlesByAsset[activeAsset] : [];
  const currentCandle = activeCandles.length > 0 ? activeCandles[activeCandles.length - 1] : null;
  const currentPrice = currentCandle?.close ?? INITIAL_PRICE;
  const highlightMessage = activePattern?.message ?? null;
  const isBCoinActive = activeAsset === 'BCoin';
  const currencySymbol = isBCoinActive ? '$' : '₺';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.proBanner}>
        <Text style={styles.proTitle}>Serbest İşlem Alanı</Text>
        <Text style={styles.proSubtitle}>
          Canlı piyasa verisiyle pratik yap. Önerilen seviye: 3+ oyuncular.
        </Text>
      </View>

      <View style={styles.assetTabs}>
        {ASSETS.map((asset) => {
          const isActive = asset.key === activeAsset;
          return (
            <TouchableOpacity
              key={asset.key}
              style={[styles.assetTab, isActive && styles.assetTabActive]}
              onPress={() => setActiveAsset(asset.key)}
            >
              <Text style={[styles.assetTabText, isActive && styles.assetTabTextActive]}>{asset.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <PriceChart candles={activeCandles} isLive={isBCoinActive} currencySymbol={currencySymbol} />
      <View style={styles.spacer} />
      <InfoCard tip={tip} highlight={highlightMessage} />
      <TradePanel
        portfolio={portfolio}
        currentPrice={currentPrice}
        currentAssetKey={activeAsset}
        onPortfolioChange={onPortfolioChange}
        activePattern={activePattern}
        currencySymbol={currencySymbol}
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
  proBanner: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  proTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  proSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  spacer: {
    height: 12,
  },
  assetTabs: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  assetTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: 'center',
    backgroundColor: theme.colors.cardSoft,
  },
  assetTabActive: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
  },
  assetTabText: {
    fontSize: 12,
    color: theme.colors.textSoft,
  },
  assetTabTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});

