// PainelHistoricoAcoes.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PainelHistoricoAcoes() {
  const [logs, setLogs] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('data_hora');
  const [ordemAsc, setOrdemAsc] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const porPagina = 10;

  useEffect(() => {
    buscarLogs();
  }, []);

  const buscarLogs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/logs');
      setLogs(response.data);
      setMensagem('');
    } catch (err) {
      setMensagem('Erro ao carregar logs');
    }
  };

  const ordenarColuna = (coluna) => {
    if (ordenarPor === coluna) {
      setOrdemAsc(!ordemAsc);
    } else {
      setOrdenarPor(coluna);
      setOrdemAsc(true);
    }
  };

  const logsOrdenados = [...logs].sort((a, b) => {
    const valA = a[ordenarPor]?.toString().toLowerCase();
    const valB = b[ordenarPor]?.toString().toLowerCase();
    if (valA < valB) return ordemAsc ? -1 : 1;
    if (valA > valB) return ordemAsc ? 1 : -1;
    return 0;
  });

  const totalPaginas = Math.ceil(logsOrdenados.length / porPagina);
  const dadosPaginados = logsOrdenados.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  return (
    <div className="bg-white p-4 rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">Histórico de Ações</h2>
      {mensagem && <p className="text-red-600 font-medium mb-2">{mensagem}</p>}

      {logs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border text-sm">
            <thead className="bg-gray-100">
              <tr>
                {['usuario', 'acao', 'registro_afetado', 'data_hora'].map((col) => (
                  <th
                    key={col}
                    onClick={() => ordenarColuna(col)}
                    className="px-4 py-2 border cursor-pointer text-left"
                  >
                    {col.charAt(0).toUpperCase() + col.slice(1)}{' '}
                    {ordenarPor === col && (ordemAsc ? '▲' : '▼')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-1">{item.usuario}</td>
                  <td className="px-4 py-1">{item.acao}</td>
                  <td className="px-4 py-1 break-all">{item.registro_afetado}</td>
                  <td className="px-4 py-1">{new Date(item.data_hora).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4 text-sm">
            <div>Página {paginaAtual} de {totalPaginas}</div>
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
      )}
    </div>
  );
}

export default PainelHistoricoAcoes;
