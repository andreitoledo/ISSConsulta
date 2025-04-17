import React, { useState, useEffect } from 'react';
import TelaLogin from './components/TelaLogin';
import PainelCompleto from './components/PainelCompleto';
import PainelConsultaPublica from './components/PainelConsultaPublica';

function App() {
  const [perfil, setPerfil] = useState(localStorage.getItem('perfil'));
  const [nome, setNome] = useState(localStorage.getItem('nome'));

  const handleLogin = (perfil) => {
    setPerfil(perfil);
    setNome(localStorage.getItem('nome'));
  };

  const handleLogout = () => {
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
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Sair
            </button>
          </div>

          {perfil === 'admin' && <PainelCompleto />}
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
