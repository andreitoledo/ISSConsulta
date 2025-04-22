// PainelCompleto.jsx - com ordenação, paginação, filtro, exportação Excel + CRUD completo
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { FileDown } from 'lucide-react';

function PainelCompleto() {
  const [dados, setDados] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [filtro, setFiltro] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('municipio');
  const [ordemAsc, setOrdemAsc] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  const [novoRegistro, setNovoRegistro] = useState({ municipio: '', servico: '', aliquota: '', retencao: false, tomador: '', emissor: '', prestacao: '' });
  const porPagina = 10;

  const carregarDados = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/consulta', { params: novoRegistro });
      setDados(res.data);
    } catch (err) {
      setMensagem('Erro ao carregar dados');
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const ordenarColuna = (coluna) => {
    if (ordenarPor === coluna) {
      setOrdemAsc(!ordemAsc);
    } else {
      setOrdenarPor(coluna);
      setOrdemAsc(true);
    }
  };

  const exportarParaExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ISSConsulta');
    XLSX.writeFile(wb, 'iss_consulta.xlsx');
  };

  const inserirRegistro = async () => {
    try {
      await axios.post('http://localhost:3001/api/inserir', novoRegistro);
      setMensagem('Registro inserido com sucesso!');
      setNovoRegistro({ municipio: '', servico: '', aliquota: '', retencao: false, tomador: '', emissor: '', prestacao: '' });
      carregarDados();
    } catch (err) {
      setMensagem('Erro ao inserir');
    }
  };

  const alterarRegistro = async () => {
    if (!registroSelecionado) return;
    try {
      await axios.put('http://localhost:3001/api/alterar', { id: registroSelecionado.id, ...novoRegistro });
      setMensagem('Registro alterado com sucesso!');
      setRegistroSelecionado(null);
      setNovoRegistro({ municipio: '', servico: '', aliquota: '', retencao: false, tomador: '', emissor: '', prestacao: '' });
      carregarDados();
    } catch (err) {
      setMensagem('Erro ao alterar');
    }
  };

  const excluirRegistro = async () => {
    if (!registroSelecionado) return;
    try {
      await axios.delete('http://localhost:3001/api/excluir', { data: { id: registroSelecionado.id } });
      setMensagem('Registro excluído com sucesso!');
      setRegistroSelecionado(null);
      setNovoRegistro({ municipio: '', servico: '', aliquota: '', retencao: false, tomador: '', prestacao: '', emissor: '' });
      carregarDados();
    } catch (err) {
      setMensagem('Erro ao excluir');
    }
  };

  const dadosFiltrados = dados.filter((item) => {
    const texto = `${item.municipio} ${item.servico} ${item.tomador || ''} ${item.emissor || ''}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  const dadosOrdenados = [...dadosFiltrados].sort((a, b) => {
    const valA = a[ordenarPor]?.toString().toLowerCase();
    const valB = b[ordenarPor]?.toString().toLowerCase();
    if (valA < valB) return ordemAsc ? -1 : 1;
    if (valA > valB) return ordemAsc ? 1 : -1;
    return 0;
  });

  const totalPaginas = Math.ceil(dadosOrdenados.length / porPagina);
  const dadosPaginados = dadosOrdenados.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  const opcoesServicos = ['11.04', '16.02'];

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Consulta Completa</h2>
        <button onClick={exportarParaExcel} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <FileDown size={16} /> Excel
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <input placeholder="Município" className="border px-3 py-2 rounded" value={novoRegistro.municipio} onChange={(e) => setNovoRegistro({ ...novoRegistro, municipio: e.target.value })} />
        <select className="border px-3 py-2 rounded" value={novoRegistro.servico} onChange={(e) => setNovoRegistro({ ...novoRegistro, servico: e.target.value })}>
          <option value="">Selecione o Serviço</option>
          {opcoesServicos.map((servico, idx) => (
            <option key={idx} value={servico}>{servico}</option>
          ))}
        </select>
        <input placeholder="Tomador" className="border px-3 py-2 rounded" value={novoRegistro.tomador} onChange={(e) => setNovoRegistro({ ...novoRegistro, tomador: e.target.value })} />
        <input placeholder="Emissor" className="border px-3 py-2 rounded" value={novoRegistro.emissor} onChange={(e) => setNovoRegistro({ ...novoRegistro, emissor: e.target.value })} />
        <input placeholder="Prestação" className="border px-3 py-2 rounded" value={novoRegistro.prestacao} onChange={(e) => setNovoRegistro({ ...novoRegistro, prestacao: e.target.value })} />
        <input type="number" placeholder="Alíquota" className="border px-3 py-2 rounded" value={novoRegistro.aliquota} onChange={(e) => setNovoRegistro({ ...novoRegistro, aliquota: e.target.value })} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={novoRegistro.retencao} onChange={(e) => setNovoRegistro({ ...novoRegistro, retencao: e.target.checked })} />
          Retenção
        </label>
        <button onClick={carregarDados} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Consultar</button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <button onClick={inserirRegistro} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">Inserir</button>
        <button onClick={alterarRegistro} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Alterar</button>
        <button onClick={excluirRegistro} className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800">Excluir</button>
        <button onClick={() => setRegistroSelecionado(null) || setNovoRegistro({ municipio: '', servico: '', aliquota: '', retencao: false, tomador: '', prestacao: '', emissor: '' })} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Limpar Campos</button>
        <input type="text" placeholder="Filtrar resultados..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="border px-3 py-2 rounded w-full sm:w-64" />
      </div>

      {mensagem && <p className="text-blue-900 font-medium text-sm mb-2">{mensagem}</p>}

      {dados.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                {['tomador', 'emissor', 'municipio', 'servico', 'aliquota', 'retencao'].map((col) => (
                  <th key={col} onClick={() => ordenarColuna(col)} className="px-4 py-2 border cursor-pointer text-left">
                    {col.charAt(0).toUpperCase() + col.slice(1)} {ordenarPor === col && (ordemAsc ? '▲' : '▼')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((item, idx) => (
                <tr key={idx} className="border-t cursor-pointer hover:bg-blue-50" onClick={() => {
                  setRegistroSelecionado(item);
                  setNovoRegistro({
                    municipio: item.municipio,
                    servico: item.servico,
                    aliquota: item.aliquota,
                    retencao: item.retencao,
                    tomador: item.tomador || '',
                    prestacao: item.prestacao || '',
                    emissor: item.emissor || ''
                  });
                }}>
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

      {dados.length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <div>Página {paginaAtual} de {totalPaginas}</div>
          <div className="flex gap-2">
            <button onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))} disabled={paginaAtual === 1} className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50">Anterior</button>
            <button onClick={() => setPaginaAtual((p) => Math.min(p + 1, totalPaginas))} disabled={paginaAtual === totalPaginas} className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50">Próxima</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PainelCompleto;
