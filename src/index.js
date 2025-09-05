const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Todo = require('./models/Todo'); // Seu modelo já existe

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CONEXÃO COM MONGODB (já funciona!)
async function conectarMongoDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Você está conectado ao MongoDB Atlas com Mongoose!');
    } catch (error) {
        console.error('Deu ruim: Erro ao conectar MongoDB:', error);
        process.exit(1);
    }
}

// 🔥 ROTAS CRUD ATUALIZADAS 🔥

// GET ALL - Listar todos os todos (você pode adicionar filtro por owner depois)
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find().populate('owner', 'name email');
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET BY ID - Buscar um todo específico
app.get('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id).populate('owner', 'name email');
        if (!todo) {
            return res.status(404).json({ error: 'Todo não encontrado' });
        }
        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Criar novo todo (você precisará passar o owner)
app.post('/todos', async (req, res) => {
    try {
        const todo = new Todo({
            title: req.body.title,
            done: req.body.done || false,
            owner: req.body.owner // ID do usuário
        });
        
        const savedTodo = await todo.save();
        await savedTodo.populate('owner', 'name email');
        res.status(201).json(savedTodo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT - Atualizar todo
app.put('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndUpdate(
            req.params.id,
            { 
                title: req.body.title,
                done: req.body.done
            },
            { new: true, runValidators: true }
        ).populate('owner', 'name email');
        
        if (!todo) {
            return res.status(404).json({ error: 'Todo não encontrado' });
        }
        res.json(todo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE - Remover todo
app.delete('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: 'Todo não encontrado' });
        }
        res.json({ message: 'Todo deletado com sucesso', deletedTodo: todo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET BY OWNER - Listar todos de um usuário específico
app.get('/todos/user/:userId', async (req, res) => {
    try {
        const todos = await Todo.find({ owner: req.params.userId })
                              .populate('owner', 'name email');
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({ 
        message: 'API Todo CRUD funcionando!', 
        endpoints: {
            getAll: 'GET /todos',
            getOne: 'GET /todos/:id',
            create: 'POST /todos',
            update: 'PUT /todos/:id',
            delete: 'DELETE /todos/:id',
            byUser: 'GET /todos/user/:userId'
        }
    });
});

// INICIAR SERVIDOR
async function iniciarServidor() {
    try {
        await conectarMongoDB();
        app.listen(port, () => {
            console.log(`O Servidor rodando na porta ${port}`);
            console.log(`Acesse: http://localhost:${port}`);
            console.log('Endpoints CRUD disponíveis em /todos');
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
    }
}

iniciarServidor();