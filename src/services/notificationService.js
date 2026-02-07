const sendBroadcast = async ({ providerIds, payload }) => {
  return { success: true, providerIds, payload };
};

module.exports = { sendBroadcast };
