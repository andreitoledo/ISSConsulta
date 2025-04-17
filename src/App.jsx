import React, { useState } from 'react';
import PainelCompleto from './components/PainelCompleto';
import PainelConsultaPublica from './components/PainelConsultaPublica';
import './styles.css';

function App() {
  const [tela, setTela] = useState('consulta');
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');

  const autenticar = () => {
    if (senha === 'admin123') {
      setAutenticado(true);
      setTela('admin');
      setSenha('');
    } else {
      alert('Senha incorreta.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">ISS Consulta</h1>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setTela('consulta')}
            className={`px-4 py-2 rounded font-medium border ${tela === 'consulta' ? 'bg-blue-700 text-white' : 'bg-white text-blue-700 border-blue-700'} hover:bg-blue-800 hover:text-white`}
          >
            Consulta Pública
          </button>
          {!autenticado ? (
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Senha Admin"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="border px-3 py-2 rounded"
              />
              <button
                onClick={autenticar}
                className="px-4 py-2 rounded font-medium border bg-green-700 text-white hover:bg-green-800"
              >
                Entrar Admin
              </button>
            </div>
          ) : (
            <button
              onClick={() => setTela('admin')}
              className={`px-4 py-2 rounded font-medium border ${tela === 'admin' ? 'bg-green-700 text-white' : 'bg-white text-green-700 border-green-700'} hover:bg-green-800 hover:text-white`}
            >
              Acesso Admin
            </button>
          )}
        </div>

        {tela === 'consulta' && <PainelConsultaPublica />}
        {tela === 'admin' && autenticado && <PainelCompleto />}
      </div>
    </div>
  );
}

export default App;
