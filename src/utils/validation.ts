export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{5,6}$/;
  return pincodeRegex.test(pincode);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    return '+' + cleaned;
  }
  return cleaned;
};

