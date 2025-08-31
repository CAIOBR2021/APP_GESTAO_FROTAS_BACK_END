// sgrm-backend/index.ts

import express from 'express';
import cors from 'cors';
import {
  addEntrega,
  getEntregas,
  initDb,
  deleteEntrega,
  updateEntrega,
} from './database';
import { Entrega } from './types';

const app = express();
const port = 3001;

// --- CORREÇÃO DEFINITIVA AQUI ---
// Damos permissão para ambos os endereços: localhost e 127.0.0.1
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requisições sem 'origin' (ex: Postman, apps mobile) ou se a origem está na nossa lista
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Acesso negado pelo CORS'));
      }
    },
  }),
);
// --- FIM DA CORREÇÃO ---

// Este também deve vir antes das rotas
app.use(express.json());

// Inicializa o banco de dados
initDb();

// Rota para buscar todas as entregas (GET /api/entregas)
app.get('/api/entregas', async (req, res) => {
  try {
    const entregas = await getEntregas();
    res.json(entregas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar entregas' });
  }
});

// Rota para adicionar uma nova entrega (POST /api/entregas)
app.post('/api/entregas', async (req, res) => {
  try {
    const novaEntrega: Entrega = req.body;
    const result = await addEntrega(novaEntrega);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar entrega' });
  }
});

// Rota para deletar uma entrega (DELETE /api/entregas/:id)
app.delete('/api/entregas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    await deleteEntrega(id);
    res.status(204).send(); // 204 No Content indica sucesso sem corpo de resposta
  } catch (error) {
    console.error('Erro ao deletar entrega:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.put('/api/entregas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const entregaAtualizada: Entrega = req.body;
    await updateEntrega(id, entregaAtualizada);
    res.status(200).json({ message: `Entrega #${id} atualizada com sucesso.` });
  } catch (error) {
    console.error('Erro ao atualizar entrega:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${port}`);
});
