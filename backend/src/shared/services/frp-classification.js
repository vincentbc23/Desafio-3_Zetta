export const classifyRiskByFrp = (frpValue) => {
  if (!Number.isFinite(frpValue)) {
    return 'indefinido';
  }

  if (frpValue < 50) {
    return 'baixo';
  }

  if (frpValue <= 500) {
    return 'moderado';
  }

  return 'alto';
};
