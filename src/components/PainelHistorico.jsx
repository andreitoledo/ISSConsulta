// PainelHistorico.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PainelHistorico() {
  const [logs, setLogs] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ordenarPor, setOrdenarPor] = useState('data_hora');
  const [ordemAsc, setOrdemAsc] = useState(false);
  const [filtro, setFiltro] = useState('');
  const porPagina = 10;

  useEffect(() => {
    buscarLogs();
  }, []);

  const buscarLogs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    }
  };

  const logsFiltrados = logs.filter((log) =>
    Object.values(log).some((val) => val?.toString().toLowerCase().includes(filtro.toLowerCase()))
  );

  const logsOrdenados = [...logsFiltrados].sort((a, b) => {
    const valA = a[ordenarPor]?.toString().toLowerCase();
    const valB = b[ordenarPor]?.toString().toLowerCase();
    if (valA < valB) return ordemAsc ? -1 : 1;
    if (valA > valB) return ordemAsc ? 1 : -1;
    return 0;
  });

  const totalPaginas = Math.ceil(logsOrdenados.length / porPagina);
  const dadosPaginados = logsOrdenados.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  const ordenarColuna = (coluna) => {
    if (ordenarPor === coluna) {
      setOrdemAsc(!ordemAsc);
    } else {
      setOrdenarPor(coluna);
      setOrdemAsc(true);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-xl font-bold mb-4">Histórico de Ações</h2>
      <input
        type="text"
        placeholder="Filtrar logs..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="border px-3 py-2 rounded w-full md:w-1/3 mb-4"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-gray-100">
            <tr>
              {['data_hora', 'usuario', 'acao', 'registro_afetado'].map((col) => (
                <th
                  key={col}
                  onClick={() => ordenarColuna(col)}
                  className="px-4 py-2 border cursor-pointer text-left"
                >
                  {col.replace('_', ' ').toUpperCase()} {ordenarPor === col && (ordemAsc ? '▲' : '▼')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dadosPaginados.map((log, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-1 whitespace-nowrap">{new Date(log.data_hora).toLocaleString()}</td>
                <td className="px-4 py-1">{log.usuario}</td>
                <td className="px-4 py-1">{log.acao}</td>
                <td className="px-4 py-1 break-all">{log.registro_afetado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm">
        <div>
          Página {paginaAtual} de {totalPaginas}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
            disabled={paginaAtual === 1}
            className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setPaginaAtual((p) => Math.min(p + 1, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
            className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}

export default PainelHistorico;
