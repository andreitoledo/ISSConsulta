import React, { useState } from 'react';
import axios from 'axios';

function TelaLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        email,
        senha
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('perfil', response.data.perfil);
      localStorage.setItem('nome', response.data.nome);
      onLogin(response.data.perfil);
    } catch (err) {
      setMensagem(err.response?.data?.message || 'Erro ao realizar login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Acesso ao Sistema</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-semibold text-sm">E-mail</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-sm">Senha</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          {mensagem && <p className="text-red-600 text-sm font-medium">{mensagem}</p>}
          <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default TelaLogin;
