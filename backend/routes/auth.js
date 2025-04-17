import express from 'express';
import sql from 'mssql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = 'sua_chave_secreta'; // Ideal: usar variável de ambiente

// LOGIN
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM usuarios WHERE email = @email AND ativo = 1');

    const usuario = result.recordset[0];
    if (!usuario) return res.status(401).json({ message: 'Usuário não encontrado ou inativo.' });

    const match = await bcrypt.compare(senha, usuario.senha);
    if (!match) return res.status(401).json({ message: 'Senha incorreta.' });

    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil, nome: usuario.nome },
      JWT_SECRET,
      { expiresIn: '4h' }
    );

    res.json({ token, perfil: usuario.perfil, nome: usuario.nome });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ message: 'Erro interno no login.' });
  }
});

// REGISTRO DE USUÁRIO
router.post('/registro', async (req, res) => {
  const { nome, email, senha, perfil } = req.body;

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const pool = await sql.connect();

    await pool.request()
      .input('nome', sql.VarChar, nome)
      .input('email', sql.VarChar, email)
      .input('senha', sql.VarChar, senhaHash)
      .input('perfil', sql.VarChar, perfil)
      .query('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (@nome, @email, @senha, @perfil)');

    res.json({ message: 'Usuário criado com sucesso!' });
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    res.status(500).json({ message: 'Erro interno ao registrar usuário.' });
  }
});

export default router;
