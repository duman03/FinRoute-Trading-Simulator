export function calculatePortfolioValue({ balance, positionSize, currentPrice }) {
  const positionValue = positionSize * currentPrice;
  return Number((balance + positionValue).toFixed(2));
}

export function executeBuy({ balance, positionSize, currentPrice, amountToInvest }) {
  if (amountToInvest <= 0 || amountToInvest > balance) {
    return { balance, positionSize };
  }

  const sharesToBuy = amountToInvest / currentPrice;
  const newPositionSize = positionSize + sharesToBuy;
  const newBalance = balance - amountToInvest;

  return {
    balance: Number(newBalance.toFixed(2)),
    positionSize: Number(newPositionSize.toFixed(4)),
  };
}

export function executeSell({ balance, positionSize, currentPrice, percentageToSell }) {
  if (percentageToSell <= 0 || positionSize <= 0) {
    return { balance, positionSize };
  }

  const sharesToSell = positionSize * Math.min(percentageToSell, 1);
  const cashFromSale = sharesToSell * currentPrice;

  const newPositionSize = positionSize - sharesToSell;
  const newBalance = balance + cashFromSale;

  return {
    balance: Number(newBalance.toFixed(2)),
    positionSize: Number(newPositionSize.toFixed(4)),
  };
}

