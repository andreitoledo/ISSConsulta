// PainelConsultaPublica.jsx - Consulta pública com filtro rápido e exportação
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function PainelConsultaPublica() {
  const [municipio, setMunicipio] = useState('');
  const [servico, setServico] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('municipio');
  const [ordemAsc, setOrdemAsc] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtro, setFiltro] = useState('');
  const porPagina = 10;

  const handleConsulta = async () => {
    setMensagem('');
    try {
      const params = {};
      if (municipio) params.municipio = municipio;
      if (servico) params.servico = servico;
      const response = await axios.get('http://localhost:3001/api/consulta', { params });
      if (response.data.length === 0) {
        setMensagem('Nenhum registro encontrado.');
      }
      setResultados(response.data);
      setPaginaAtual(1);
    } catch (err) {
      setMensagem('Erro ao consultar dados.');
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

  const resultadosFiltrados = resultados.filter(item => {
    const texto = `${item.municipio} ${item.servico} ${item.tomador || ''} ${item.emissor || ''}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  const resultadosOrdenados = [...resultadosFiltrados].sort((a, b) => {
    const valA = a[ordenarPor]?.toString().toLowerCase();
    const valB = b[ordenarPor]?.toString().toLowerCase();
    if (valA < valB) return ordemAsc ? -1 : 1;
    if (valA > valB) return ordemAsc ? 1 : -1;
    return 0;
  });

  const totalPaginas = Math.ceil(resultadosOrdenados.length / porPagina);
  const dadosPaginados = resultadosOrdenados.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  const exportarParaExcel = () => {
    const ws = XLSX.utils.json_to_sheet(resultados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Consulta');
    XLSX.writeFile(wb, 'consulta_publica.xlsx');
  };

  return (
    <div className="bg-white p-6 rounded shadow mt-4">
      <h2 className="text-xl font-bold mb-4">Consulta Pública</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Município</label>
          <input className="w-full border px-3 py-2 rounded" value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Tipo de Serviço</label>
          <select className="w-full border px-3 py-2 rounded" value={servico} onChange={(e) => setServico(e.target.value)}>
            <option value="">Selecione</option>
            <option value="16.02">Transporte Municipal - 16.02</option>
            <option value="11.04">Carga e Descarga - 11.04</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        <button onClick={handleConsulta} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Consultar</button>
        <button onClick={exportarParaExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Exportar Excel</button>
        <input
          type="text"
          placeholder="Filtrar resultados..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-64"
        />
      </div>
      {mensagem && <p className="mt-2 text-red-600 font-medium text-sm">{mensagem}</p>}

      {resultados.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full table-auto text-sm border">
            <thead className="bg-gray-100">
              <tr>
                {['tomador', 'emissor', 'municipio', 'servico', 'aliquota', 'retencao'].map((col) => (
                  <th
                    key={col}
                    onClick={() => ordenarColuna(col)}
                    className="px-4 py-2 border cursor-pointer text-left"
                  >
                    {col.charAt(0).toUpperCase() + col.slice(1)} {ordenarPor === col && (ordemAsc ? '▲' : '▼')}
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
      )}

      {resultados.length > 0 && (
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

export default PainelConsultaPublica;
