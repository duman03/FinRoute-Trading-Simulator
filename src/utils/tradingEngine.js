export function calculatePortfolioValue({ balance, positionsByAsset, pricesByAsset }) {
  const positions = positionsByAsset ?? {};
  const prices = pricesByAsset ?? {};

  const positionValue = Object.keys(positions).reduce((sum, key) => {
    const qty = positions[key] ?? 0;
    const price = prices[key] ?? 0;
    return sum + qty * price;
  }, 0);

  return Number((balance + positionValue).toFixed(2));
}

export function executeBuyAsset({ balance, positionsByAsset, assetKey, currentPrice, amountToInvest }) {
  if (amountToInvest <= 0 || amountToInvest > balance) {
    return { balance, positionsByAsset };
  }

  const currentPositions = positionsByAsset ?? {};
  const currentQty = currentPositions[assetKey] ?? 0;

  const sharesToBuy = amountToInvest / currentPrice;
  const newQty = currentQty + sharesToBuy;
  const newBalance = balance - amountToInvest;

  return {
    balance: Number(newBalance.toFixed(2)),
    positionsByAsset: {
      ...currentPositions,
      [assetKey]: Number(newQty.toFixed(4)),
    },
  };
}

export function executeSellAsset({ balance, positionsByAsset, assetKey, currentPrice, percentageToSell }) {
  const currentPositions = positionsByAsset ?? {};
  const currentQty = currentPositions[assetKey] ?? 0;

  if (percentageToSell <= 0 || currentQty <= 0) {
    return { balance, positionsByAsset };
  }

  const sharesToSell = currentQty * Math.min(percentageToSell, 1);
  const cashFromSale = sharesToSell * currentPrice;

  const newQty = currentQty - sharesToSell;
  const newBalance = balance + cashFromSale;

  return {
    balance: Number(newBalance.toFixed(2)),
    positionsByAsset: {
      ...currentPositions,
      [assetKey]: Number(newQty.toFixed(4)),
    },
  };
}

