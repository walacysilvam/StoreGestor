
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// CRIAR USUARIO
exports.createUser = async (req, res) => {
    try {
        console.log("Dados recebidos:", req.body); // Log para verificar o corpo da requisição
        const { firstname, surname, email, password } = req.body;

        if (!firstname || !surname || !email || !password) {
            return res.status(400).json({ message: "Dados inválidos ou incompletos" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstname,
            surname,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            id: user.id,
            firstname: user.firstname,
            surname: user.surname,
            email: user.email,
        });
    } catch (error) {
        console.error("Erro ao criar usuário:", error); // Log detalhado do erro
        res.status(400).json({ message: "Erro ao criar usuário", error });
    }
};


// BUSCAR TODOS USUARIOS
exports.getAllUsers = async(req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({ message: 'Erro ao buscar usuários', error});
    }
};

// BUSCAR USUARIO-ID
exports.getUserById = async(req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario não encontrado.'});
        }

        res.status(200).json({
            id: user.id,
            firstname: user.firstname,
            surname: user.surname,
            email: user.email
        });
    } catch (error) {
        res.status(404).json({ message: 'Erro ao buscar usuário', error});
    }
};

// UPDATE->USER
exports.updateUser = async(req, res) => {
    try {
        const { id } = req.params;
        const { firstname, surname, email, password } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não econtrado'});
        }

        user.firstname = firstname || user.firstname;
        user.surname = surname || user.surname;
        user.email = email || user.email;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.status(200).json({ 
            id: user.id,
            firstname: user.firstname,
            surname: user.surname,
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o usuário', error});
    }
}

// DELETE USER
exports.deleteUser = async(req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado'});
        }

        await user.destroy(); // apaga o user

        res.status(200).json({ message: 'Usuário deletado com sucesso'});
    } catch (error) {
        res.status(404).json({ message: 'Error ao deletar usuário', error});
    }
};

// AUTENTICAÇÃO
exports.login = async(req, res) => {
    const { email, password } = req.body;

    try {
        //verificando o email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado'});
        }

        // verficando a senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        //Gerando o Token
        const token = jwt.sign(
            { id: user.id, email: user.email },         // payload
            process.env.JWT_SECRET,                     // - chave e
            { expiresIn: process.env.JWT_EXPIRES_IN }   // - expiracao
        );

        res.status(200).json({ "token": token });
    } catch (error) {
        console.error('Erro no login: ', error);    // log p verificar erro
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};