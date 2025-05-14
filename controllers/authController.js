import User from '../models/userModel.js';
import { sendOTP, verifyOTP } from '../utils/otpService.js';
import { generateToken } from '../utils/generateToken.js';

export const requestOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  try {
    const sessionId = await sendOTP(phone);
    res.status(200).json({ sessionId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP', details: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { sessionId, otp, phone } = req.body;

  try {
    const result = await verifyOTP(sessionId, otp);

    if (result.Status === 'Success') {
      const user = await User.findOne({ phone });

      // Generate token (user ID if exists or phone if not)
      const token = generateToken(user ? user._id : phone);

      // If user exists, send back user data and token
      if (user) {
        return res.status(200).json({
          message: 'OTP verified successfully',
          token,
          redirectToHome: true, // Indicating that the user is registered
          user: {
            id: user._id,
            phone: user.phone,
            name: user.name,
            email: user.email,
            address: user.address,
            pincode: user.pincode,
          },
        });
      }

      // If user does not exist, prompt to enter details
      return res.status(200).json({
        message: 'OTP verified successfully. Please fill in your details.',
        token,
        redirectToHome: false, // Indicating that the user needs to fill details
        user: { phone },
      });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (err) {
    console.error('OTP verification failed:', err);
    res.status(500).json({ error: 'OTP verification failed', details: err.message });
  }
};

export const getalluser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const postUser = async (req, res) => {
  console.log('Received body:', req.body);  // Log the body for debugging
  const { phone, email, name, address, pincode } = req.body;

  // Check if any required fields are missing
  if (!phone || !name || !address || !pincode || !email) {
    console.log('Missing required fields');
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ phone, email, name, address, pincode });
    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('User creation failed:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};


