const jwtHelper = require('../utils/jwt');

exports.validateToken = (call, callback) => {
    const { token } = call.request;

    try {
        const decoded = jwtHelper.verifyToken(token);

        callback(null, {
            valid: true,
            userId: decoded.userId,
            email: decoded.email,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            username: decoded.username
        });

    } catch (err) {
        callback(null, {
            valid: false,
            userId: "",
            email: "",
            firstName: "",
            lastName: "",
            username: ""
        });
    }
};
