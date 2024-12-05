
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth')

// ROTAS USUARIO::
// novo usuario
/**
 * --> /v1/user:
 *              Deixei essa endpoint(POST) sem autenticaão
 *              pois é necessario criar um usuário no sistema.
 *              Julgo inlógico exigir um token quando um USER
 *              ainda não existe.
 */
router.post('/v1/user', userController.createUser);
// buscar user->id
router.get('/v1/user/:id', userController.getUserById);
// atualizar user->id
router.put('/v1/user/:id', auth.authenticateToken, userController.updateUser);
// delete user->id
router.delete('/v1/user/:id', auth.authenticateToken, userController.deleteUser);

// login-> token
router.post('/v1/user/token', userController.login);

module.exports = router;