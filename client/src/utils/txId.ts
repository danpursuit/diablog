export const generateTransactionId = () => {
  // Get current timestamp
  const timestamp = Date.now();

  // Generate 6 random alphanumeric characters
  const randomPart = Math.random().toString(36).substring(2, 8);

  // Combine them with a prefix
  return `t-${timestamp}-${randomPart}`;
};
