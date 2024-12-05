
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

// ROTAS CATEGORIA::
// nova categoria
router.post('/v1/category', auth.authenticateToken, categoryController.createCategory );
// todas as categorias
router.get('/v1/category/search', categoryController.getCategories );
// categorias por id
router.get('/v1/category/:id', categoryController.getCategoryById );
// atualizar uma categoria
router.put('/v1/category/:id', auth.authenticateToken, categoryController.updateCategory );
// deleta uma categoria
router.delete('/v1/category/:id', auth.authenticateToken, categoryController.deleteCategory );

module.exports = router;