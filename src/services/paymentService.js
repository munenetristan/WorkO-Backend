const verifyPayment = async (reference) => {
  if (!reference) {
    return { success: false };
  }
  return { success: true, provider: 'placeholder' };
};

module.exports = { verifyPayment };
