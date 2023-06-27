const bcrypt = require("bcrypt");
const User = require("../models/user");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const {
  setCookie,
  generateToken,
  generateOtp,
  sendMail,
} = require("../utils/features");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const avatar = req.files.avatar.tempFilePath;
    if (!name || !email || !password || !avatar) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exist.",
      });
    }
    const encryptedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();
    sendMail(otp, email);

    const mycloud = await cloudinary.uploader.upload(avatar, {
      folder: "todoApp",
    });
    fs.rmSync("./tmp", { recursive: true });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: encryptedPassword,
      avatar: {
        public_id: mycloud.public_id,
        url: mycloud.url,
      },
      otp,
      otp_expiry: new Date(Date.now() + 1000 * 60 * 61 * 5),
    });

    const token = await generateToken(process.env.SECRET_KEY, user._id);
    setCookie(res, "token", token);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = await generateToken(process.env.SECRET_KEY, user._id);
    setCookie(res, "token", token);
    res.status(201).json({
      success: true,
      message: "User login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verify = async (req, res) => {
  try {
    const user = req.user;
    const { otp } = req.body;
    if (otp !== user.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const { otp_expiry } = user;
    const newDate = new Date(Date.now() + 1000 * 60 * 60 * 5);
    if (otp_expiry < newDate) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
      await User.findByIdAndDelete({ _id: user._id });
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    res.status(201).json({
      success: true,
      message: "User Verified",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const profile = async (req, res) => {
  try {
    const user = req.user;

    res.status(201).json({
      success: true,
      message: "User Profile",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name } = req.body;
    const avatar = req.files.avatar.tempFilePath;

    if (!name && !avatar) {
      return res.status(400).json({
        success: false,
        message: "Plz enter updating data",
      });
    }

    if (name) user.name = name;

    if (avatar) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
      const mycloud = await cloudinary.uploader.upload(avatar);
      fs.rmSync("./tmp", { recursive: true });

      user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.url,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const checkPassword = await bcrypt.compare(oldPassword, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        message: "Password does not match",
      });
    }

    const password = await bcrypt.hash(newPassword, 10);

    user.password = password;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Updated password successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    const otp = generateOtp();

    user.forgetPasswordOtp = otp;
    user.forgetPasswordOtpExpiry = new Date(Date.now() + 1000 * 60 * 61 * 5);
    await user.save();
    res.status(201).json({
      success: true,
      message: "Otp sent to your email address",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    if (!otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ forgetPasswordOtp: otp });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const { forgetPasswordOtpExpiry } = user;
    const newDate = new Date(Date.now() + 1000 * 60 * 60 * 5);

    if (forgetPasswordOtpExpiry < newDate) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.forgetPasswordOtp = null;
    user.forgetPasswordOtpExpiry = null;

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    user.password = encryptedPassword;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Reset password successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    setCookie(res, "token", null);
    return res.status(200).json({
      success: true,
      message: "User Logout successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  verify,
  profile,
  updateProfile,
  updatePassword,
  forgetPassword,
  resetPassword,
  logout,
};
