// server.js
import express from 'express';
import sql from 'mssql';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const config = {
  user: 'iss_user',
  password: 'Admin@123',
  server: 'localhost',
  database: 'ISSConsulta',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Conectar ao banco
sql.connect(config).then(() => {
  console.log('✅ Conectado ao SQL Server');
}).catch(err => console.error('❌ Erro na conexão SQL:', err));

// Função para registrar logs
const registrarLog = async (usuario, acao, dados) => {
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('usuario', sql.NVarChar, usuario)
      .input('acao', sql.NVarChar, acao)
      .input('registro_afetado', sql.NVarChar(sql.MAX), JSON.stringify(dados))
      .query(`
        INSERT INTO logs_acoes (usuario, acao, registro_afetado)
        VALUES (@usuario, @acao, @registro_afetado)
      `);
  } catch (err) {
    console.error('Erro ao registrar log:', err);
  }
};

// LOGIN
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM usuarios WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const usuario = result.recordset[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: usuario.id, perfil: usuario.perfil }, 'chave_secreta');
    res.json({ token, perfil: usuario.perfil, nome: usuario.nome });
  } catch (err) {
    console.error('Erro ao realizar login:', err);
    res.status(500).json({ message: 'Erro interno ao realizar login.' });
  }
});

// LOG DE LOGIN/LOGOUT
app.post('/api/logacesso', async (req, res) => {
  const { usuario, acao } = req.body;

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('usuario', sql.NVarChar, usuario)
      .input('acao', sql.NVarChar, acao)
      .input('registro_afetado', sql.NVarChar(sql.MAX), JSON.stringify({ acao }))
      .query(`
        INSERT INTO logs_acoes (usuario, acao, registro_afetado)
        VALUES (@usuario, @acao, @registro_afetado)
      `);
    res.json({ message: 'Log de acesso registrado' });
  } catch (err) {
    console.error('Erro ao registrar log de acesso:', err);
    res.status(500).json({ message: 'Erro ao registrar log de acesso', error: err.message });
  }
});


// CONSULTA HISTÓRICO
app.get('/api/historico', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM logs_acoes ORDER BY data_hora DESC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao consultar histórico', error: err.message });
  }
});

// CONSULTA REGISTROS
app.get('/api/consulta', async (req, res) => {
  const { municipio, servico, tomador, prestacao, emissor, aliquota } = req.query;

  try {
    const pool = await sql.connect(config);
    let query = 'SELECT * FROM aliquotas_iss WHERE 1=1';
    if (municipio) query += ` AND LOWER(municipio) = LOWER('${municipio}')`;
    if (servico) query += ` AND servico = '${servico}'`;
    if (tomador) query += ` AND tomador = '${tomador}'`;
    if (prestacao) query += ` AND prestacao = '${prestacao}'`;
    if (emissor) query += ` AND emissor = '${emissor}'`;
    if (aliquota) query += ` AND aliquota = ${aliquota}`;

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao consultar', error: err.message });
  }
});

// INSERIR
app.post('/api/inserir', async (req, res) => {
  const { municipio, servico, aliquota, retencao, tomador, prestacao, emissor } = req.body;
  const usuario = req.headers['usuario'] || 'desconhecido';

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('municipio', sql.VarChar, municipio)
      .input('servico', sql.VarChar, servico)
      .input('aliquota', sql.Decimal(5, 2), aliquota)
      .input('retencao', sql.Bit, retencao)
      .input('tomador', sql.VarChar, tomador)
      .input('prestacao', sql.VarChar, prestacao)
      .input('emissor', sql.VarChar, emissor)
      .query(`
        INSERT INTO aliquotas_iss (municipio, servico, aliquota, retencao, tomador, prestacao, emissor)
        VALUES (@municipio, @servico, @aliquota, @retencao, @tomador, @prestacao, @emissor)
      `);

    await registrarLog(usuario, 'inserir', req.body);
    res.status(200).json({ message: 'Registro inserido com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao inserir', error: err.message });
  }
});

// ALTERAR
app.put('/api/alterar', async (req, res) => {
  const { id, municipio, servico, aliquota, retencao, tomador, prestacao, emissor } = req.body;
  const usuario = req.headers['usuario'] || 'desconhecido';

  if (!id) return res.status(400).json({ message: 'ID do registro não foi informado!' });

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('municipio', sql.VarChar, municipio)
      .input('servico', sql.VarChar, servico)
      .input('aliquota', sql.Decimal(5, 2), aliquota)
      .input('retencao', sql.Bit, retencao)
      .input('tomador', sql.VarChar, tomador)
      .input('prestacao', sql.VarChar, prestacao)
      .input('emissor', sql.VarChar, emissor)
      .query(`
        UPDATE aliquotas_iss SET municipio=@municipio, servico=@servico, aliquota=@aliquota,
        retencao=@retencao, tomador=@tomador, prestacao=@prestacao, emissor=@emissor
        WHERE id=@id
      `);

    if (result.rowsAffected[0] > 0) {
      await registrarLog(usuario, 'alterar', req.body);
      res.json({ message: 'Registro alterado com sucesso!' });
    } else {
      res.status(404).json({ message: 'Registro não encontrado.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao alterar registro.', error: err.message });
  }
});

// EXCLUIR
app.delete('/api/excluir', async (req, res) => {
  const { id } = req.body;
  const usuario = req.headers['usuario'] || 'desconhecido';

  if (!id) return res.status(400).json({ message: 'ID do registro não foi informado!' });

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM aliquotas_iss WHERE id = @id');

    if (result.rowsAffected[0] > 0) {
      await registrarLog(usuario, 'excluir', { id });
      res.json({ message: 'Registro excluído com sucesso!' });
    } else {
      res.status(404).json({ message: 'Registro não encontrado para excluir.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir', error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
