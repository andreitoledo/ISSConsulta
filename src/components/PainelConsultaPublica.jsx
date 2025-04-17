// PainelConsultaPublica.jsx com headers de usuário para log no backend
import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function PainelConsultaPublica() {
  const [municipio, setMunicipio] = useState('');
  const [servico, setServico] = useState('');
  const [resultado, setResultado] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [filtro, setFiltro] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ordenarPor, setOrdenarPor] = useState('');
  const [ordemAsc, setOrdemAsc] = useState(true);
  const porPagina = 10;

  const headers = { headers: { usuario: localStorage.getItem('nome') || 'desconhecido' } };

  const handleConsulta = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/consulta', {
        params: { municipio, servico },
        ...headers
      });
      setResultado(response.data);
      setMensagem(response.data.length === 0 ? 'Nenhum registro encontrado.' : 'Consulta realizada com sucesso.');
      setPaginaAtual(1);
    } catch (err) {
      setMensagem('Erro ao consultar dados.');
    }
  };

  const resultadoFiltrado = resultado.filter((item) =>
    Object.values(item).some((val) => val?.toString().toLowerCase().includes(filtro.toLowerCase()))
  );

  const resultadoOrdenado = [...resultadoFiltrado].sort((a, b) => {
    if (!ordenarPor) return 0;
    const valA = a[ordenarPor]?.toString().toLowerCase();
    const valB = b[ordenarPor]?.toString().toLowerCase();
    if (valA < valB) return ordemAsc ? -1 : 1;
    if (valA > valB) return ordemAsc ? 1 : -1;
    return 0;
  });

  const totalPaginas = Math.ceil(resultadoOrdenado.length / porPagina);
  const dadosPaginados = resultadoOrdenado.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  const ordenarColuna = (coluna) => {
    if (ordenarPor === coluna) {
      setOrdemAsc(!ordemAsc);
    } else {
      setOrdenarPor(coluna);
      setOrdemAsc(true);
    }
  };

  const handleExportarExcel = () => {
    const planilha = XLSX.utils.json_to_sheet(resultado);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, planilha, 'Aliquotas');
    XLSX.writeFile(wb, 'consulta_publica.xlsx');
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-xl font-bold mb-4">Consulta Pública</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Município</label>
          <input
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Serviço</label>
          <select
            value={servico}
            onChange={(e) => setServico(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Todos</option>
            <option value="16.02">Transporte Municipal - 16.02</option>
            <option value="11.04">Carga e Descarga - 11.04</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <button
          onClick={handleConsulta}
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          Consultar
        </button>
        <input
          type="text"
          placeholder="Filtrar resultados..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-64"
        />
      </div>

      {mensagem && <p className="mb-2 font-medium text-sm text-blue-800">{mensagem}</p>}

      {resultado.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {['tomador', 'emissor', 'municipio', 'servico', 'aliquota', 'retencao'].map((col) => (
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
                    <td className="px-4 py-1">{item.tomador || '-'}</td>
                    <td className="px-4 py-1">{item.emissor || '-'}</td>
                    <td className="px-4 py-1">{item.municipio}</td>
                    <td className="px-4 py-1">{item.servico}</td>
                    <td className="px-4 py-1">{item.aliquota}%</td>
                    <td className="px-4 py-1">{item.retencao ? 'Sim' : 'Não'}</td>
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
            <button
              onClick={handleExportarExcel}
              className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
            >
              Exportar Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PainelConsultaPublica;
