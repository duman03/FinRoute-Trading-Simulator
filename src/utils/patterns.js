export function detectCandlestickPattern(candles) {
  if (!candles || candles.length < 2) {
    return null;
  }

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  const lastBody = Math.abs(last.close - last.open);
  const lastRange = Math.max(last.high - last.low, last.open * 0.001);

  const isDoji = lastBody <= lastRange * 0.15;

  const prevBodyLow = Math.min(prev.open, prev.close);
  const prevBodyHigh = Math.max(prev.open, prev.close);
  const lastBodyLow = Math.min(last.open, last.close);
  const lastBodyHigh = Math.max(last.open, last.close);

  const isPrevBear = prev.close < prev.open;
  const isLastBull = last.close > last.open;
  const isEngulf =
    isPrevBear && isLastBull && lastBodyLow <= prevBodyLow && lastBodyHigh >= prevBodyHigh;

  if (isEngulf) {
    return {
      type: 'bullish_engulfing',
      message: '🚀 Yutan Boğa! Yükseliş trendi başlayabilir.',
    };
  }

  if (isDoji) {
    return {
      type: 'doji',
      message: '🔥 Doji Formasyonu Yakalandı! Piyasa kararsız.',
    };
  }

  return null;
}

