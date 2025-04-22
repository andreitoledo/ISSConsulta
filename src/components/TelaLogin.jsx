import React, { useState } from 'react';
import axios from 'axios';

function TelaLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

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
  
      // 👉 CHAMADA para registrar o log de acesso
      await axios.post('http://localhost:3001/api/logacesso', {
        usuario: response.data.nome,
        acao: 'login'
      });
  
      onLogin(response.data.perfil);
    } catch (err) {
      setMensagem(err.response?.data?.message || 'Erro ao realizar login');
    }
  };
  

  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Acesso ao Sistema</h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1" htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="exemplo@iss.com"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            className="w-full border rounded px-3 py-2"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            placeholder="********"
          />
        </div>

        {mensagem && (
          <p className="text-red-600 font-medium text-sm text-center">{mensagem}</p>
        )}

        <button
          type="submit"
          className={`w-full text-white py-2 rounded transition ${
            carregando ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'
          }`}
          disabled={carregando}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

export default TelaLogin;
