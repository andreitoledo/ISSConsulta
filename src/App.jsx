import React, { useState, useEffect } from 'react';
import TelaLogin from './components/TelaLogin';
import PainelCompleto from './components/PainelCompleto';
import PainelConsultaPublica from './components/PainelConsultaPublica';
import PainelHistoricoAcoes from './components/PainelHistoricoAcoes';
import { FiClock, FiLogOut } from 'react-icons/fi';

function App() {
  const [perfil, setPerfil] = useState(localStorage.getItem('perfil'));
  const [nome, setNome] = useState(localStorage.getItem('nome'));
  const [telaAtual, setTelaAtual] = useState('principal');

  const handleLogin = (perfil) => {
    setPerfil(perfil);
    setNome(localStorage.getItem('nome'));
  };

  const handleLogout = async () => {
    const usuario = localStorage.getItem('nome');
    try {
      await axios.post('http://localhost:3001/api/logout', { usuario });
    } catch (err) {
      console.warn('Erro ao registrar logout:', err);
    }
    localStorage.clear();
    setPerfil(null);
    setNome(null);
  };
  

  useEffect(() => {
    document.title = 'ISS Consulta';
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 text-gray-800">
      {perfil ? (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center bg-white p-4 rounded shadow mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Sistema ISS Consulta</h1>
              <p className="text-sm text-gray-600">Bem-vindo, {nome}</p>
            </div>
            <div className="flex items-center gap-3">
              {perfil === 'admin' && (
                <button
                  onClick={() => setTelaAtual(telaAtual === 'historico' ? 'principal' : 'historico')}
                  className="flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300"
                >
                  <FiClock className="text-xl" />
                  {telaAtual === 'historico' ? 'Voltar' : 'Histórico'}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
              >
                <FiLogOut className="text-xl" />
                Sair
              </button>
            </div>
          </div>

          {/* Telas renderizadas conforme perfil e estado */}
          {perfil === 'admin' && telaAtual === 'historico' && <PainelHistoricoAcoes />}
          {perfil === 'admin' && telaAtual === 'principal' && <PainelCompleto />}
          {perfil === 'consulta' && <PainelConsultaPublica />}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gray-200">
          <TelaLogin onLogin={handleLogin} />
        </div>
      )}
    </main>
  );
}

export default App;
