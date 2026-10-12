const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendEmail');
const crypto = require('crypto');
const EmailOTP = require('../models/emailOTP.model');

// Register a new user
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const isExist = await User.findOne({ email });

        if (isExist) {
            return res.status(400).json({
                message: "User already exists with this email.",
                status: "failed"
            });
        }

        // Create user
        const user = await User.create({
            email,
            name,
            password
        });

        const otp = crypto.randomInt(100000, 1000000).toString();

        const otpHash = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        await EmailOTP.findOneAndUpdate(
            { email: user.email },
            {
                otpHash,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            },
            {
                upsert: true,
                returnDocument: 'after',
                runValidators: true
            }
        );

        const message = `Welcome to EzyMart, ${name}!

        Your email verification OTP is: ${otp}

        This OTP expires in 10 minutes.`;

        await sendMail(user.email, 'Verify Your EzyMart Email', message);
        return res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email using the OTP sent to your email address.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                verified: user.verified
            }
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body
    try{
        const user = await User.findOne({ email }).select("+password");
        if(!user){
            return res.status(401).json({
                message: "User or password is invalid."
            })
        }
        const isVallidPassword = await user.comparePassword(password)

        if(!isVallidPassword){
                return res.status(401).json({
                message: "User or password is invalid."
            })
        }
        if (!user.verified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in'
            });
        }
        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn: "3d"})

        res.cookie("token", token)

        res.status(200).json({
            user: {
                _id: (await user)._id,
                email: (await user).email,
                name: (await user).name
            },
            token
        })
    }
    catch(error) {
        res.status(500).json({
            message: "Server error."
        })
    }
}

// Get user
const getUser = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users)
    } catch (error) {
        res.status(500).json({
            message: "Server error."
        })
    }
}
// Email verification
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and OTP are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (user.verified) {
            return res.status(400).json({
                message: 'Email is already verified'
            });
        }

        const otpRecord = await EmailOTP.findOne({
            email: normalizedEmail
        });

        if (!otpRecord || otpRecord.expiresAt.getTime() <= Date.now()) {
            return res.status(400).json({
                message: 'OTP expired or not found. Please register again or request a new OTP.'
            });
        }

        const otpHash = crypto
            .createHash('sha256')
            .update(String(otp))
            .digest('hex');

        if (otpHash !== otpRecord.otpHash) {
            return res.status(400).json({
                message: 'Invalid OTP'
            });
        }

        user.verified = true;
        await user.save();

        await EmailOTP.deleteOne({ _id: otpRecord._id });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '3d' }
        );

        return res.status(200).json({
            message: 'Email verified successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                verified: user.verified
            },
            token
        });

    } catch (error) {
        console.error('Verify email error:', error);

        return res.status(500).json({
            message: 'Email verification failed'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUser,
    verifyEmail
};
