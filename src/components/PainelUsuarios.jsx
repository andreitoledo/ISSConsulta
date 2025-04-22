// PainelUsuarios.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PainelUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ id: null, nome: '', email: '', senha: '', perfil: 'consulta' });
  const [mensagem, setMensagem] = useState('');

  const carregarUsuarios = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      setMensagem('Erro ao carregar usuários');
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await axios.put('http://localhost:3001/api/usuarios', form);
        setMensagem('Usuário atualizado com sucesso');
      } else {
        await axios.post('http://localhost:3001/api/usuarios', form);
        setMensagem('Usuário criado com sucesso');
      }
      setForm({ id: null, nome: '', email: '', senha: '', perfil: 'consulta' });
      carregarUsuarios();
    } catch (err) {
      setMensagem('Erro ao salvar usuário');
    }
  };

  const handleEditar = (usuario) => {
    setForm({ ...usuario, senha: '' });
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Confirma a exclusão do usuário?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/usuarios/${id}`);
      setMensagem('Usuário excluído com sucesso');
      carregarUsuarios();
    } catch (err) {
      setMensagem('Erro ao excluir usuário');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Gerenciar Usuários</h2>

      {mensagem && <p className="text-green-600 font-medium mb-4">{mensagem}</p>}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Nome"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={form.senha}
          onChange={(e) => setForm({ ...form, senha: e.target.value })}
          className="border rounded px-3 py-2"
          required={!form.id} // senha obrigatória apenas ao criar
        />
        <select
          value={form.perfil}
          onChange={(e) => setForm({ ...form, perfil: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="admin">Administrador</option>
          <option value="consulta">Consulta</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {form.id ? 'Atualizar' : 'Criar Usuário'}
        </button>
      </form>

      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Nome</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Perfil</th>
            <th className="p-2 border">Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border">
              <td className="p-2 border">{u.nome}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.perfil}</td>
              <td className="p-2 border space-x-2">
                <button
                  onClick={() => handleEditar(u)}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleExcluir(u.id)}
                  className="text-red-600 hover:underline"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PainelUsuarios;
