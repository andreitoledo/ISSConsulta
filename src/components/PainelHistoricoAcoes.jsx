// PainelHistoricoAcoes.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PainelHistoricoAcoes() {
  const [historico, setHistorico] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('data_hora');
  const [ordemAsc, setOrdemAsc] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const porPagina = 10;

  const fetchHistorico = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/historico');
      setHistorico(response.data);
      setMensagem('');
    } catch (err) {
      setMensagem('Erro ao buscar histórico de ações.');
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  const ordenarColuna = (coluna) => {
    if (ordenarPor === coluna) {
      setOrdemAsc(!ordemAsc);
    } else {
      setOrdenarPor(coluna);
      setOrdemAsc(true);
    }
  };

  const historicoOrdenado = [...historico].sort((a, b) => {
    const valA = a[ordenarPor]?.toString().toLowerCase();
    const valB = b[ordenarPor]?.toString().toLowerCase();
    if (valA < valB) return ordemAsc ? -1 : 1;
    if (valA > valB) return ordemAsc ? 1 : -1;
    return 0;
  });

  const totalPaginas = Math.ceil(historicoOrdenado.length / porPagina);
  const dadosPaginados = historicoOrdenado.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  return (
    <div className="bg-white p-6 rounded shadow mt-4">
      <h2 className="text-xl font-bold mb-4">Histórico de Ações</h2>
      {mensagem && <p className="text-red-600 mb-4 font-medium">{mensagem}</p>}

      {historico.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm border">
            <thead className="bg-gray-100">
              <tr>
                {['usuario', 'acao', 'registro_afetado', 'data_hora'].map((col) => (
                  <th
                    key={col}
                    onClick={() => ordenarColuna(col)}
                    className="px-4 py-2 border cursor-pointer text-left"
                  >
                    {col.charAt(0).toUpperCase() + col.slice(1).replace('_', ' ')} {ordenarPor === col && (ordemAsc ? '▲' : '▼')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-1">{item.usuario}</td>
                  <td className="px-4 py-1">{item.acao}</td>
                  <td className="px-4 py-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                    <pre className="whitespace-pre-wrap text-xs text-gray-700">{item.registro_afetado}</pre>
                  </td>
                  <td className="px-4 py-1">{new Date(item.data_hora).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {historico.length > 0 && (
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
      )}
    </div>
  );
}

export default PainelHistoricoAcoes;
