export const calculatePrice = (weight, ratePerGram, makingCostPercent, wastagePercent) => {
  const w = parseFloat(weight);
  const r = parseFloat(ratePerGram);
  const m = parseFloat(makingCostPercent);
  const ws = parseFloat(wastagePercent);

  if ([w, r, m, ws].some(isNaN)) return null;

  const basePrice = w * r;
  const makingCost = (m / 100) * basePrice;
  const wastageCost = (ws / 100) * basePrice;
  const totalPrice = Math.round(basePrice + makingCost + wastageCost);

  return {
    totalPrice,
    basePrice,
    makingCost: Math.round(makingCost),
    wastageCost: Math.round(wastageCost),
    goldRatePerGram: Math.round(r),
  };
};
