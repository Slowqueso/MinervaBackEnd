const relation = (number, greaterNumber, lesserNumber) => {
  if (lesserNumber < number < greaterNumber) {
    return true;
  } else {
    return false;
  }
};
