/* 
    _______  _______  _______       _______ _________ _        _______ 
    (  ___  )(  ____ )(  ____ )     (  ____ \\__   __/( \      (  ____ \
    | (   ) || (    )|| (    )|     | (    \/   ) (   | (      | (    \/
    | (___) || (____)|| (____)|     | (__       | |   | |      | (__    
    |  ___  ||  _____)|  _____)     |  __)      | |   | |      |  __)   
    | (   ) || (      | (           | (         | |   | |      | (      
    | )   ( || )      | )           | )      ___) (___| (____/\| (____/\
    |/     \||/       |/            |/       \_______/(_______/(_______/

    ARQUIVO PRINCIPAL
*/

//  <-- IMPORTS -->
const express = require('express');
// Rotas ---------------------
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
// --------------------------- fim.
// Modelos -------------------
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const ProductImage = require('./models/Product_img');
const ProductOptions = require('./models/Product_opts');
const ProductCategory = require('./models/Product_ctgs');
// --------------------------- fim.

// sincronizando com o banco para teste
sequelize.sync({ alter: true }).then(() => {
    console.log('Tabelas sincronizadas com sucesso!');
}).catch((error) => {
    console.error('Erro ao sincronizar tabelas...', error);
});

// Relacionamentos -----------
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'prod_images' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(ProductOptions, { foreignKey: 'product_id', as: 'opts_images' });
ProductOptions.belongsTo(Product, { foreignKey: 'product_id' });

Product.belongsToMany(Category, { through: ProductCategory, foreignKey: 'product_id', as: 'categories' });
Category.belongsToMany(Product, { through: ProductCategory, foreignKey: 'category_id', as: 'products' });
// --------------------------- fim.

// App init aqui
const app = express();
app.use(express.json());

// Rotas aqui ::
// depois retornar referencias da api aqui
app.get('/test', (req, res) => {
    res.status(200).json({ message: 'API funcionando!' });
});

app.use('/', userRoutes);       // rotas do usuario
app.use('/', categoryRoutes);   // rotas de categorias
app.use('/', productRoutes);    // rotas de produtos

// Middlewares aqui::
// Middleware para lidar com erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Ops! algo deu errado! :(');
});

module.exports = app;
