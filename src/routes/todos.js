const express = require('express');
const Todo = require('../models/Todo');
const auth = require('../middlewares/auth');
const { todoSchema } = require('../validation/schemas');

const router = express.Router();

// Criar todo
router.post('/', auth, async (req, res) => {
  const { error } = todoSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const todo = await Todo.create({ ...req.body, owner: req.userId });
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar todo' });
  }
});

// Listar todos do usuário
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ owner: req.userId });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar todos' });
  }
});

// Obter todo por id
router.get('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, owner: req.userId });
    if (!todo) return res.status(404).json({ error: 'Todo não encontrado' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar todo' });
  }
});

// Atualizar todo
router.put('/:id', auth, async (req, res) => {
  const { error } = todoSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      req.body,
      { new: true }
    );
    if (!todo) return res.status(404).json({ error: 'Todo não encontrado' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar todo' });
  }
});

// Deletar todo
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!todo) return res.status(404).json({ error: 'Todo não encontrado' });
    res.json({ message: 'Todo removido' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover todo' });
  }
});

module.exports = router;
