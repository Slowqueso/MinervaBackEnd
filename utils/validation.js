const isEmailCorrect = (email) => {
  if (
    !/^(([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})+([;.](([a-zA-Z0-9_\-\.]+)@{[a-zA-Z0-9_\-\.]+0\.([a-zA-Z]{2,5}){1,25})+)*$/i.test(
      email
    )
  ) {
    return true;
  } else {
    return false;
  }
};

const isContactCorrect = (contact) => {
  if (
    !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(contact)
  ) {
    return true;
  } else {
    return false;
  }
};

export { isContactCorrect, isEmailCorrect };
