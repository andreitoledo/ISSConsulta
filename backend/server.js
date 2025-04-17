import express from 'express';
import sql from 'mssql';
import cors from 'cors';
import authRoutes from './routes/auth.js';



const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);

const config = {
  user: 'iss_user',
  password: 'Admin@123',
  server: 'localhost',
  database: 'ISSConsulta',
  options: {
    encrypt: false,
    enableArithAbort: true,
    trustServerCertificate: true
  }
};

// Conexão inicial
sql.connect(config).then(() => {
  console.log('Conectado ao SQL Server');
}).catch((err) => console.error('Erro na conexão SQL:', err));

// Consulta - esta OK
app.get('/api/consulta', async (req, res) => {
  const { municipio, servico } = req.query;

  if (!municipio) {
    return res.status(400).json({ message: 'Município é obrigatório para consulta.' });
  }

  let query = 'SELECT * FROM aliquotas_iss WHERE LOWER(municipio) = LOWER(@municipio)';
  const params = [{ name: 'municipio', type: sql.VarChar, value: municipio }];

  if (servico) {
    query += ' AND servico = @servico';
    params.push({ name: 'servico', type: sql.VarChar, value: servico });
  }

  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Erro ao consultar:', err);
    res.status(500).json({ message: 'Erro ao consultar', error: err });
  }
});

// Inserir - esta OK
app.post('/api/inserir', async (req, res) => {
  const { municipio, servico, aliquota, retencao, tomador, emissor, prestacao } = req.body;

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('municipio', sql.VarChar, municipio)
      .input('servico', sql.VarChar, servico)
      .input('aliquota', sql.Decimal(5, 2), aliquota)
      .input('retencao', sql.Bit, retencao)
      .input('tomador', sql.VarChar, tomador)
      .input('emissor', sql.VarChar, emissor)
      .input('prestacao', sql.VarChar, prestacao)
      .query(`
        INSERT INTO aliquotas_iss 
        (municipio, servico, aliquota, retencao, tomador, emissor, prestacao)
        VALUES (@municipio, @servico, @aliquota, @retencao, @tomador, @emissor, @prestacao)
      `);

    res.status(200).json({ message: 'Registro inserido com sucesso!' });
  } catch (err) {
    console.error('Erro ao inserir dados:', err);
    res.status(500).json({ message: err.message });
  }
});

// Alterar
app.put('/api/alterar', async (req, res) => {
  const { id, municipio, servico, aliquota, retencao, tomador, emissor, prestacao } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID do registro não foi informado!' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('municipio', sql.VarChar(255), municipio)
      .input('servico', sql.VarChar(255), servico)
      .input('aliquota', sql.Decimal(5, 2), aliquota)
      .input('retencao', sql.Bit, retencao)
      .input('tomador', sql.VarChar(255), tomador)
      .input('emissor', sql.VarChar(255), emissor)
      .input('prestacao', sql.VarChar(255), prestacao)
      .query(`
        UPDATE aliquotas_iss 
        SET municipio = @municipio, servico = @servico, aliquota = @aliquota, retencao = @retencao,
            tomador = @tomador, emissor = @emissor, prestacao = @prestacao
        WHERE id = @id
      `);

    if (result.rowsAffected[0] > 0) {
      res.json({ message: 'Registro alterado com sucesso!' });
    } else {
      res.status(404).json({ message: 'Registro não encontrado.' });
    }
  } catch (err) {
    console.error('Erro ao alterar registro:', err);
    res.status(500).json({ message: 'Erro ao alterar registro.' });
  }
});


// Excluir
app.delete('/api/excluir', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID do registro não foi informado para exclusão.' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM aliquotas_iss WHERE id = @id');

    if (result.rowsAffected[0] > 0) {
      res.json({ message: 'Registro excluído com sucesso' });
    } else {
      res.status(404).json({ message: 'Registro não encontrado para excluir' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir', error: err });
  }
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
