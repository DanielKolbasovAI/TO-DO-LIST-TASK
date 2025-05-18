const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '1h';

exports.registerUser = async ({ username, email, firstName, lastName, password }) => {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) throw new Error('Email or username already exists');

    const user = await User.create({
        username,
        email,
        firstName,
        lastName,
        password
    });

    return {
        user: extractUser(user),
        token: generateToken(user)
    };
};

exports.GetUsersByIds = async (call) => {
    try {
        const userIds = call.request.usersIds;

        const users = await User.find({ _id: { $in: userIds } });

        users.forEach(user => {
            call.write({
                userId: user._id.toString(),
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            });
        });

        call.end();

    } catch (err) {
        console.error(err);
        call.destroy(err);
    }
};

exports.loginUser = async (username, password) => {
    const user = await User.findOne({ username });
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid username or password');

    return {
        user: extractUser(user),
        token: generateToken(user)
    };
};

exports.logoutUser = (userId) => {
    console.log(`User ${userId} requested logout`);
    return true;
};

exports.checkUsernameExists = async (username) => {
    const user = await User.findOne({ username });
    return !!user;
};

function generateToken(user) {
    return jwt.sign(
        {
            userId: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function extractUser(user) {
    return {
        userId: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
    };
}
