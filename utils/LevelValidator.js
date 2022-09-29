const isLevelValid = (level, creditScore) => {
  if (level > 0) {
    if (creditScore >= 2000 && level <= 5) {
      return true;
    } else if (creditScore >= 1500 && creditScore < 2000 && level <= 4) {
      return true;
    } else if (creditScore >= 1000 && creditScore < 1500 && level <= 3) {
      return true;
    } else if (creditScore >= 500 && creditScore < 1000 && level <= 2) {
      return true;
    } else if (creditScore >= 100 && creditScore < 500 && level === 1) {
      return true;
    } else {
      return false;
    }
  }
  return false;
};

export default isLevelValid;
