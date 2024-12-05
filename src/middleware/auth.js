
const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(400).json({ error: 'Token não fornecido'});
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // adiiciona o token ao req
        next();

    } catch (error) {
        return res.status(400).json({  error: 'Bad Request. Token invalido ou ausente.' });
    }
};