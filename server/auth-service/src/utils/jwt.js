const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'devsecret';


exports.verifyToken = (token) => {
    return jwt.verify(token, SECRET);
};
