
const Category = require('../models/Category');

// CRIAR CATEGORIA
exports.createCategory = async(req, res) => {
    const { name, slug, use_in_menu } = req.body;

    try {
        const category = await Category.create({ 
            name,
            slug,
            use_in_menu,
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar categoria', details: error.message });

    }
};

// LISTAR CATEGORIAS USANDO FILTRO
exports.getCategories = async(req, res) => {

    const { limit = 12, page = 1, fields, use_in_menu } = req.query;

    try {
        const queryOptions = {};
        // filtro para os campos especificos
        if (fields) {
            queryOptions.attributes = fields.split(',');
        }

        // Filtro para categorias do menu.
        /* 
            comparando de forma rigorosa se
            use_in_menu é diferente em TIPO e VALOR!
        */
        if ( use_in_menu !== undefined ) {
            queryOptions.where = {
                use_in_menu: use_in_menu === 'true'
            };
        }

        // Paginação
        /*  
            offset calcula o ponto inicial da nova pagina (page - 1 * limit)
            para usar como ponto de partida na próxima busca
        */
        if (parseInt(limit) !== -1) {
            const offset = (page -1) * limit;
            queryOptions.limit = parseInt(limit);
            queryOptions.offset = offset;
        }

        // fazendo a consulta das queries
        const categories = await Category.findAll(queryOptions);
        res.status(200).json(categories);
    } catch (error) {
        res.status(400).json({ error: 'Bad Request', details: error.message });
    }
};

//  BUSCAR CATEGORIAS -> ID
exports.getCategoryById = async(req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);

        if(!category) {
            res.status(404).json({ error: 'Categoria não encontrada.'});
        }

        res.status(200).json({category});
    } catch (error) {
        res.status(404).json({ error: 'Erro ao buscar categoria', details: error.message });
    }
};

// ATUALIZAR UMA CATEGORIA
exports.updateCategory = async(req, res) => {
    const { id } = req.params;
    const { name, slug, use_in_menu } = req.body;

    try {
        const category = await Category.findByPk(id);

        if(!category) {
            res.status(404).json({ error: 'Categoria não encontrada.'});
        }

        category.name = name || category.name;
        category.slug = slug || category.slug;
        category.use_in_menu = use_in_menu || category.use_in_menu;
        await category.save();

        res.status(200).json({
            name: category.name,
            slug: category.slug,
            use_in_menu: category.use_in_menu
        });
    } catch (error) {
        res.status(400).json({error: 'Bad Resquest'});
    }
};

// DELETAR UMA CATEGORIA -> ID
exports.deleteCategory = async(req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);

        if (!category) {
            res.status(404).json({error: 'Categoria não encontrada'});
        }

        await category.destroy();
        res.status(200).json({message: 'Categoria excluída com sucesso!'});
    } catch (error) {
        res.status(400).json({error: 'Bad Request'});
    }
};