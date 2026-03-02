export const INITIAL_PRICE = 100;

export function generateNextCandle(previousClose) {
  const base = previousClose ?? INITIAL_PRICE;

  const maxMove = base * 0.012; // %1.2 civarı volatilite
  const closeDelta = (Math.random() * 2 - 1) * maxMove;
  let close = base + closeDelta;
  if (close < 10) close = 10;

  const open = base;

  const highShadow = Math.random() * (base * 0.006);
  const lowShadow = Math.random() * (base * 0.006);

  const high = Math.max(open, close) + highShadow;
  let low = Math.min(open, close) - lowShadow;
  if (low < 5) low = 5;

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

