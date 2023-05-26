const allowedPrices = {
  1: [0, 5],
  2: [0, 10],
  3: [0, 30],
  4: [0, 50],
  5: [0, 100],
};

const isPriceValid = (level, joinPrice) => {
  if (joinPrice <= allowedPrices[level][1]) {
    return true;
  }
  return false;
};

export default isPriceValid;
