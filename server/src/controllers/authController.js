const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendEmail');

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

        // Generate OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const message = `Welcome to EzyMart, ${name}!

Your OTP for EzyMart registration is: ${otp}

Thank you for registration.`;

        // Send email
        await sendMail(
            email,
            "Welcome to EzyMart",
            message
        );

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        return res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
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

module.exports = {
    registerUser,
    loginUser,
    getUser
};
