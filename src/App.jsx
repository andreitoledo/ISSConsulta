// App.jsx
import React, { useState, useEffect } from 'react';
import TelaLogin from './components/TelaLogin';
import PainelCompleto from './components/PainelCompleto';
import PainelConsultaPublica from './components/PainelConsultaPublica';
import PainelHistoricoAcoes from './components/PainelHistoricoAcoes';
import PainelUsuarios from './components/PainelUsuarios';

function App() {
  const [perfil, setPerfil] = useState(localStorage.getItem('perfil'));
  const [nome, setNome] = useState(localStorage.getItem('nome'));
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);

  const handleLogin = (perfil) => {
    setPerfil(perfil);
    setNome(localStorage.getItem('nome'));
  };

  const handleLogout = () => {
    localStorage.clear();
    setPerfil(null);
    setNome(null);
  };

  const toggleHistorico = () => {
    setMostrarHistorico((prev) => !prev);
    setMostrarUsuarios(false);
  };

  const toggleUsuarios = () => {
    setMostrarUsuarios((prev) => !prev);
    setMostrarHistorico(false);
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
            <div className="flex gap-4">
              {perfil === 'admin' && (
                <>
                  <button
                    onClick={toggleHistorico}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    {mostrarHistorico ? 'Fechar Histórico' : 'Ver Histórico'}
                  </button>
                  <button
                    onClick={toggleUsuarios}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {mostrarUsuarios ? 'Fechar Usuários' : 'Gerenciar Usuários'}
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>

          {mostrarHistorico ? (
            <PainelHistoricoAcoes />
          ) : mostrarUsuarios ? (
            <PainelUsuarios />
          ) : perfil === 'admin' ? (
            <PainelCompleto />
          ) : (
            <PainelConsultaPublica />
          )}
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
