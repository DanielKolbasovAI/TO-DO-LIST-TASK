const authClient = require('../utils/authClient');

module.exports = function(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    authClient.ValidateToken({ token }, (err, response) => {
        if (err || !response.valid) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.user = {
            userId: response.userId,
            email: response.email,
            role: response.role
        };

        next();
    });
};
