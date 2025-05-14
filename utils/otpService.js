import axios from 'axios';

const API_KEY = process.env.TWO_FACTOR_API_KEY;
const temp_name = process.env.OTP_TEMP_NAME;

export const sendOTP = async (phone) => {
  const url = `https://2factor.in/API/V1/${API_KEY}/SMS/${phone}/AUTOGEN3/:${temp_name}`;
  const res = await axios.get(url);
  return res.data.Details; // session ID
};

export const verifyOTP = async (sessionId, otp) => {
  const url = `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionId}/${otp}`;
  const res = await axios.get(url);
  return res.data;
};
