const allowedPrices = {
  1: [0, 3],
  2: [0, 20],
  3: [0, 40],
  4: [0, 60],
  5: [0, 100],
};

const isPriceValid = (level, joinPrice) => {
  if (joinPrice <= allowedPrices[level][1]) {
    return true;
  }
  return false;
};

export default isPriceValid;
