const axios = require("axios");

const paystackClient = axios.create({
  baseURL: "https://api.paystack.co",
  headers: { "Content-Type": "application/json" },
});

paystackClient.interceptors.request.use((config) => {
  config.headers["Authorization"] = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
  return config;
});

const initializeTransaction = async ({ email, amount, reference, callbackUrl }) => {
  const response = await paystackClient.post("/transaction/initialize", {
    email,
    amount,
    reference,
    callback_url: callbackUrl,
  });
  return response.data.data;
};

const verifyTransaction = async (reference) => {
  const response = await paystackClient.get(`/transaction/verify/${reference}`);
  return response.data.data;
};

module.exports = { initializeTransaction, verifyTransaction };
