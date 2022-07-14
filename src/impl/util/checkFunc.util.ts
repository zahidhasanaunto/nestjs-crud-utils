export const isMobileNumber = (phoneNumber: string): string | boolean => {
  try {
    const regex = /^\+?01[3-9][0-9]{8}\b$/g;
    let validNumber: any;
    const number = phoneNumber.match(regex);

    if (number) {
      number.map((number: any) => {
        validNumber = number.slice(number.length - 11, number.length);
      });
      return validNumber;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const isEmail = (email: string): string | boolean => {
  try {
    const regex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let validEmail: any;
    const _email = email.match(regex);

    if (_email.length) {
      validEmail = _email[0];
      return validEmail;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
