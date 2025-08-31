// sgrm-backend/database.ts
import * as sqlite3 from 'sqlite3';
import path from 'path';
import { Entrega } from './types';

const dbPath = path.resolve(__dirname, 'sgrm.db');
const db = new sqlite3.Database(dbPath);

export const initDb = () => {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS entregas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data_hora_solicitacao TEXT NOT NULL,
        local_armazenagem TEXT NOT NULL,
        local_obra TEXT NOT NULL,
        item_nome TEXT NOT NULL,
        item_quantidade REAL NOT NULL,
        item_unidade_medida TEXT NOT NULL,
        responsavel_nome TEXT,
        responsavel_telefone TEXT,
        status TEXT NOT NULL DEFAULT 'Agendado'
      );`,
      (err) => {
        if (err) console.error('Erro ao criar tabela:', err);
        else console.log('Banco de dados conectado/inicializado com sucesso.');
      },
    );
  });
};

export const addEntrega = (entrega: Entrega): Promise<{ id: number }> => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO entregas (data_hora_solicitacao, local_armazenagem, local_obra, item_nome, item_quantidade, item_unidade_medida, responsavel_nome, responsavel_telefone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      entrega.data_hora_solicitacao, entrega.local_armazenagem, entrega.local_obra,
      entrega.item_nome, entrega.item_quantidade, entrega.item_unidade_medida,
      entrega.responsavel_nome, entrega.responsavel_telefone,
    ];
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
};

export const getEntregas = (): Promise<Entrega[]> => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM entregas ORDER BY id DESC';
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Entrega[]);
    });
  });
};

// Adicione esta função em sgrm-backend/server/database.ts

export const deleteEntrega = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM entregas WHERE id = ?';
    db.run(sql, id, function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        // Opcional: Rejeita a promessa se nenhum item com esse ID for encontrado
        reject(new Error(`Entrega com ID ${id} não encontrada.`));
      } else {
        resolve();
      }
    });
  });
};

// sgrm-backend/server/database.ts

// ... (as outras funções: initDb, addEntrega, getEntregas, deleteEntrega)

export const updateEntrega = (id: number, entrega: Entrega): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE entregas 
      SET 
        data_hora_solicitacao = ?,
        local_armazenagem = ?,
        local_obra = ?,
        item_nome = ?,
        item_quantidade = ?,
        item_unidade_medida = ?,
        responsavel_nome = ?,
        responsavel_telefone = ?
      WHERE id = ?
    `;
    const params = [
      entrega.data_hora_solicitacao,
      entrega.local_armazenagem,
      entrega.local_obra,
      entrega.item_nome,
      entrega.item_quantidade,
      entrega.item_unidade_medida,
      entrega.responsavel_nome,
      entrega.responsavel_telefone,
      id
    ];

    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        reject(new Error(`Entrega com ID ${id} não encontrada para atualização.`));
      } else {
        resolve();
      }
    });
  });
};