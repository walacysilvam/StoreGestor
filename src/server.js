require('dotenv').config();
const http = require('http');
const app = require('./app');               // Importa o app configurado

const port = process.env.PORT || 3000;      // Usa a variável de ambiente ou porta padrão
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
