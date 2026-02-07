const verifyPayment = async (reference) => {
  if (!reference) {
    return { success: false };
  }
  return { success: true, provider: 'placeholder' };
};

const createBookingPayment = async (jobId, amount) => {
  return { success: true, jobId, amount, provider: 'placeholder', paymentIntentId: jobId };
};

const confirmBookingPayment = async (paymentIntentId) => {
  if (!paymentIntentId) {
    return { success: false };
  }
  return { success: true, provider: 'placeholder' };
};

module.exports = { verifyPayment, createBookingPayment, confirmBookingPayment };
