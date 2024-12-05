

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// ROTAS PRODUTOS::
// novo Produto
router.post('/v1/product', auth.authenticateToken, productController.createProduct );
// todas as categorias
router.get('/v1/product/search', productController.getProduct );
// categorias por id
router.get('/v1/product/:id', productController.getProductByID );
// atualizar uma categoria
router.put('/v1/product/:id', auth.authenticateToken, productController.updateProduct );
// deleta uma categoria
router.delete('/v1/product/:id', auth.authenticateToken, productController.deleteProduct );

module.exports = router;