

const Product = require('../models/Product');
const Category = require('../models/Category');
const ProductImage = require('../models/Product_img');
const ProductOptions = require('../models/Product_opts');

// Op será usado para realizar operações 
// de consulta no DB.
const { Op } = require('sequelize');

// CRIA UM NOVO PRODUTO
exports.createProduct = async (req, res) => {
    const {
        enabled,
        name,
        slug,
        stock,
        description,
        price,
        price_with_discount,
        category_ids,
        images,
        options
    } = req.body;

    try {
        // Validando falta de itens
        if (!name || !slug || !price || !price_with_discount) {
            return res.status(400).json({
                error: 'Bad Request. Campos obrigatórios estão faltando'
            });
        }

        // Criação do produto
        const product = await Product.create({
            enabled: enabled || false,
            name,
            slug,
            stock: stock || 0,
            description: description || '',
            price,
            price_with_discount,
        });

        // Associação categorias
        if (Array.isArray(category_ids) && category_ids.length > 0) {
            const categories = await Category.findAll({
                where: { id: category_ids },
            });
            await product.addCategories(categories); // Corrigido
        }

        // Criação de imagens
        if (Array.isArray(images) && images.length > 0) {
            const productImages = images.map(image => ({
                product_id: product.id, // Corrigido
                type: image.type,
                content: image.content,
            }));
            await ProductImage.bulkCreate(productImages);
        }

        // Opções
        if (Array.isArray(options) && options.length > 0) {
            const productOptions = options.map(option => ({
                product_id: product.id, // Corrigido
                title: option.title,
                shape: option.shape || 'square',
                radius: option.radius || 0,
                type: option.type || 'text',
                values: option.values.join(','), // Corrigido
            }));
            await ProductOptions.bulkCreate(productOptions);
        }

        // Resposta bem-sucedida
        res.status(200).json({ product });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            error: 'Erro ao criar o produto.',
            details: error.message
        });
    }
};

// BUSCA DE PRODUTOS -> FILTRO
exports.getProduct = async(req, res) => {
    let { 
        limit = 12, 
        page = 1, 
        fields, 
        match, 
        category_ids, 
        price_range, 
        option
    } = req.query;

    try {
        let queryOptions = {};

        // foi necessario converter para inteiros.
        limit = parseInt(req.query.limit, 12);
        page = parseInt(page, 10);

        let offset = 0;
        if (isNaN(page) || page < 1) page = 1;
        if (limit === -1) {
            limit = null;
        } else {
            if (isNaN(limit) || limit < 1) limit = 12; // padrão.
            offset = (page - 1) * limit;
        }

        // filtro para os campos espeficos
        if (fields) {
            queryOptions.attributes = fields.split(',');
        }

        // filtro de match
        if (match) {
            queryOptions[Op.or] = [
                { name: { [Op.iLike]: `%${match}%` }},
                { description: { [Op.iLike]: `%${match}%` } },
            ];
        }

        // Filtro de categorias
        if (category_ids) {
            const categories = category_ids.split(',').map(id => parseInt(id));

            // busca os produtos de X categoria
            queryOptions['category_ids'] = { [Op.overlap]: categories};
        }

        // Faixa de preço
        if (price_range) {
            const [minPrice, maxPrice] = price_range.split('-').map(Number);
            queryOptions.price = { [Op.between]: [minPrice, maxPrice]};
        }

        // Opções
        if (option) {
            const optionFilters = Object.keys(option).map(key => {
                return { [ Op.and ]: [{ id:key }, { values: {[Op.contains]: option[key].split(',') }}]};
            });
            queryOptions['options'] = { [Op.and]: optionFilters};
        }

        // Realizando a busca com os filtros
        const { rows, count } = await Product.findAndCountAll({
            where: queryOptions,
            limit: limit === '1' ? undefined : Number(limit), // se limite -1, remove o limite
            offset: (page - 1) * limit,                       //  Paginação. Aqui é similar a paginação de categoryController
            attributes: fields ? fields.split(',') : undefined,
            include: [
                {
                    model: Category,
                    as: 'categories',
                    attributes: ['id'],
                    through: { attributes: [] }
                },
                {
                    model: ProductImage,
                    as: 'prod_images',
                    attributes: ['id']
                },
                {
                    model: ProductOptions,
                    as: 'opts_images',
                    attributes: ['id', 'title', 'values']
                }
            ],
        });

        // Data com a formatação
        // sugerida na desc do projeto.
        const data = (rows || []).map(product => {
            return {
                id: product.id,
                enabled: product.enabled,
                name: product.name,
                slug: product.slug,
                stock: product.stock,
                description: product.description,
                price: product.price,
                price_with_discount: product.price_with_discount,
                category_ids: (product.categories || []).map(cat => cat.id),
                images: (product.productImages || []).map(img => ({
                    id: img.id
                })),
                options: (product.productOptions || []).map(opt => ({
                    id: opt.id,
                    title: opt.title,
                    values: opt.values.split(','),
                })),
            };
        });


        res.status(200).json({
            data,
            total: count,
            limit: Number(limit),
            page: Number(page),
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({error: 'Bad Request - possivel erro nos dados informados.'})
    }
};

// BUSCA PRODUTO->ID
exports.getProductByID = async(req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            res.status(404).json({ error: 'Produto não encontrado.'});
        }

        res.status(200).json({ product });
    } catch (error) {
        res.status(404).json({ error: 'Not Found, nenhum produto encontrado', details: error.message });
    }
};

// UPDATE PRODUTO -> ID
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const {
        enabled,
        name,
        slug,
        stock,
        description,
        price,
        price_with_discount,
        category_ids,
        images,
        options,
    } = req.body;

    try {
        // Encontrar produto
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Not Found' });
        }

        // Atualizando diretamente infos básicas
        await product.update({
            enabled,
            name,
            slug,
            stock,
            description,
            price,
            price_with_discount,
        });

        // Atualizando categorias
        if (Array.isArray(category_ids)) {
            const categories = await Category.findAll({
                where: { id: category_ids },
            });
            await product.setCategories(categories);
        }

        // Atualizando imagens
        if (Array.isArray(images)) {
            for (const image of images) {
                if (image.deleted) {
                    // Deletar imagem
                    await ProductImage.destroy({ where: { id: image.id, product_id: product.id } });
                } else if (image.id) {
                    // Atualizar imagem
                    await ProductImage.update(
                        { content: image.content, type: image.type },
                        { where: { id: image.id, product_id: product.id } }
                    );
                } else {
                    // Inserir nova imagem
                    await ProductImage.create({
                        product_id: product.id,
                        content: image.content,
                        type: image.type,
                    });
                }
            }
        }

        // Atualizando opções
        if (Array.isArray(options)) {
            for (const option of options) {
                if (option.deleted) {
                    // Deletar opção
                    await ProductOptions.destroy({ where: { id: option.id, product_id: product.id } });
                } else if (option.id) {
                    // Atualizar opção
                    await ProductOptions.update(
                        {
                            radius: option.radius,
                            value: option.values?.join(','),
                        },
                        { where: { id: option.id, product_id: product.id } }
                    );
                } else {
                    // Inserir nova opção
                    await ProductOptions.create({
                        product_id: product.id,
                        title: option.title,
                        shape: option.shape,
                        type: option.type,
                        values: option.values?.join(','),
                    });
                }
            }
        }

        // Retorno sem conteúdo
        res.status(204).send();
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Bad Request', details: error.message });
    }
};

// DELETE PRODUTO -> ID
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado'});
        }

        await product.destroy();

        res.status(204).send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'algo deu errado!', details: error.message });
    }
};