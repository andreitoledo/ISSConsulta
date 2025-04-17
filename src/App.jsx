import React, { useState, useEffect } from 'react';
import TelaLogin from './components/TelaLogin';
import PainelCompleto from './components/PainelCompleto';
import PainelConsultaPublica from './components/PainelConsultaPublica';

function App() {
  const [perfil, setPerfil] = useState(null);
  const [painelAtual, setPainelAtual] = useState('publico');

  useEffect(() => {
    const storedPerfil = localStorage.getItem('perfil');
    if (storedPerfil) {
      setPerfil(storedPerfil);
      setPainelAtual(storedPerfil === 'admin' ? 'completo' : 'publico');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setPerfil(null);
    setPainelAtual('publico');
  };

  if (!perfil) return <TelaLogin onLogin={(p) => { setPerfil(p); setPainelAtual(p === 'admin' ? 'completo' : 'publico'); }} />;

  return (
    <main className="min-h-screen bg-gray-100 text-gray-800">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Bem-vindo, {localStorage.getItem('nome')} ({perfil})
        </h1>

        {perfil === 'admin' && (
          <div className="flex justify-center gap-4 mb-6">
            <button onClick={() => setPainelAtual('completo')} className={`px-4 py-2 rounded ${painelAtual === 'completo' ? 'bg-blue-700 text-white' : 'bg-white border'}`}>Consulta Completa</button>
            <button onClick={() => setPainelAtual('publico')} className={`px-4 py-2 rounded ${painelAtual === 'publico' ? 'bg-blue-700 text-white' : 'bg-white border'}`}>Consulta Pública</button>
          </div>
        )}

        {painelAtual === 'completo' && perfil === 'admin' && <PainelCompleto />}
        {painelAtual === 'publico' && <PainelConsultaPublica />}

        <div className="text-center mt-8">
          <button onClick={handleLogout} className="text-sm text-blue-700 underline">Sair</button>
        </div>
      </div>
    </main>
  );
}

export default App;
