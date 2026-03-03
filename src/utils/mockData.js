export const INITIAL_PRICE = 100;

export const ASSETS = [
  { key: 'BCoin', label: 'B-Coin', basePrice: 100, volatility: 1.8 },
  { key: 'TechCorp', label: 'TechCorp', basePrice: 80, volatility: 1.2 },
  { key: 'SafeGold', label: 'SafeGold', basePrice: 60, volatility: 0.7 },
];

export const ASSET_KEYS = ASSETS.map((a) => a.key);

export function getAssetConfig(key) {
  return ASSETS.find((a) => a.key === key) ?? ASSETS[0];
}

export function generateNextCandle(assetKey, previousClose) {
  const config = getAssetConfig(assetKey);
  const basePrice = config.basePrice ?? INITIAL_PRICE;

  const base = previousClose ?? basePrice;

  const maxMove = base * 0.01 * (config.volatility ?? 1); // volatiliteye göre oynaklık
  const closeDelta = (Math.random() * 2 - 1) * maxMove;
  let close = base + closeDelta;
  if (close < 5) close = 5;

  const open = base;

  const highShadow = Math.random() * (base * 0.006 * (config.volatility ?? 1));
  const lowShadow = Math.random() * (base * 0.006 * (config.volatility ?? 1));

  const high = Math.max(open, close) + highShadow;
  let low = Math.min(open, close) - lowShadow;
  if (low < 2) low = 2;

  return {
    open: Number(open.toFixed(2)),
    high: Number(high.toFixed(2)),
    low: Number(low.toFixed(2)),
    close: Number(close.toFixed(2)),
  };
}

export function getRandomTip() {
  const tips = [
    'Direnç noktasına yaklaşıyor. Hacmi takip et.',
    'Trend kırılımına dikkat et. Sahte kırılımlara karşı stop kullan.',
    'Fiyat hareketini mum gövdeleri kadar fitiller de anlatır.',
    'Yalnızca fiyat değil, zaman da bir destektir.',
    'Tek bir indikatöre körü körüne güvenme. Fiyat aksiyonu kraldır.',
    'Destek kırıldığında çoğu zaman destek, yeni direnç olur.',
    'Volatilite artarken pozisyon boyutunu küçültmeyi düşün.',
    'Trend senin yanında olduğunda risk yönetimi daha kıymetli hale gelir.',
  ];
  const index = Math.floor(Math.random() * tips.length);
  return tips[index];
}

