// PainelConsultaPublica.jsx com exportação para Excel
import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function PainelConsultaPublica() {
  const [municipio, setMunicipio] = useState('');
  const [servico, setServico] = useState('');
  const [resultado, setResultado] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const porPagina = 10;

  const exibirMensagem = (texto) => {
    setMensagem(texto);
    setTimeout(() => setMensagem(''), 4000);
  };

  const handleConsulta = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/consulta', {
        params: { municipio, servico }
      });
      setResultado(response.data);
      setPaginaAtual(1);
      if (response.data.length === 0) {
        exibirMensagem('⚠️ Nenhum registro encontrado.');
      }
    } catch (err) {
      exibirMensagem('❌ Erro ao consultar.');
    }
  };

  const handleExportarExcel = () => {
    const planilha = XLSX.utils.json_to_sheet(resultado);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, planilha, 'ConsultaPublica');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const arquivo = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(arquivo, 'consulta_publica.xlsx');
  };

  const totalPaginas = Math.ceil(resultado.length / porPagina);
  const dadosPaginados = resultado.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  return (
    <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">Consulta Pública</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="border p-2 rounded" placeholder="Município" value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
        <select className="border p-2 rounded" value={servico} onChange={(e) => setServico(e.target.value)}>
          <option value="">Selecione o Serviço</option>
          <option value="16.02">Transporte Municipal - 16.02</option>
          <option value="11.04">Carga e Descarga - 11.04</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <button onClick={handleConsulta} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Consultar</button>
        <button onClick={handleExportarExcel} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">📥 Exportar Excel</button>
      </div>

      {mensagem && <p className="text-blue-900 font-medium mt-4">{mensagem}</p>}

      {dadosPaginados.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-left border rounded">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2">Tomador</th>
                <th className="px-4 py-2">Emissor</th>
                <th className="px-4 py-2">Município</th>
                <th className="px-4 py-2">Serviço</th>
                <th className="px-4 py-2">Alíquota</th>
                <th className="px-4 py-2">Retenção</th>
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((r, i) => (
                <tr key={i} className="border-t hover:bg-blue-50">
                  <td className="px-4 py-2">{r.tomador || '-'}</td>
                  <td className="px-4 py-2">{r.emissor || '-'}</td>
                  <td className="px-4 py-2">{r.municipio}</td>
                  <td className="px-4 py-2">{r.servico}</td>
                  <td className="px-4 py-2">{r.aliquota}%</td>
                  <td className="px-4 py-2">{r.retencao ? 'Sim' : 'Não'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center mt-4 gap-2">
            <button onClick={() => setPaginaAtual(p => Math.max(1, p - 1))} disabled={paginaAtual === 1} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Anterior</button>
            <span className="px-3 py-1">Página {paginaAtual} de {totalPaginas}</span>
            <button onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))} disabled={paginaAtual === totalPaginas} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Próxima</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PainelConsultaPublica;
