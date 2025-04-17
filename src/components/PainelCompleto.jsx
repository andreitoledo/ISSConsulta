// PainelCompleto.jsx com exportação para Excel
import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function PainelCompleto() {
  const [municipio, setMunicipio] = useState('');
  const [prestacao, setPrestacao] = useState('');
  const [emissor, setEmissor] = useState('');
  const [tomador, setTomador] = useState('');
  const [servico, setServico] = useState('');
  const [aliquota, setAliquota] = useState('');
  const [retencao, setRetencao] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [resultado, setResultado] = useState([]);
  const [linhaSelecionada, setLinhaSelecionada] = useState(null);
  const [idSelecionado, setIdSelecionado] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const porPagina = 10;

  const exibirMensagem = (texto) => {
    setMensagem(texto);
    setTimeout(() => setMensagem(''), 4000);
  };

  const limparCampos = () => {
    setMunicipio('');
    setPrestacao('');
    setEmissor('');
    setTomador('');
    setServico('');
    setAliquota('');
    setRetencao(false);
    setResultado([]);
    setIdSelecionado(null);
    setLinhaSelecionada(null);
  };

  const handleConsulta = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/consulta', {
        params: {
          municipio,
          servico,
          tomador: tomador || undefined,
          prestacao: prestacao || undefined,
          emissor: emissor || undefined
        }
      });
      setResultado(response.data);
      setPaginaAtual(1);
      if (response.data.length === 0) {
        exibirMensagem('⚠️ Nenhum registro encontrado.');
      }
    } catch (err) {
      exibirMensagem('❌ Erro ao consultar');
    }
  };

  const handleExportarExcel = () => {
    const planilha = XLSX.utils.json_to_sheet(resultado);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, planilha, 'Aliquotas');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const arquivo = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(arquivo, 'aliquotas_iss.xlsx');
  };

  const handleLinhaSelecionada = (linha, index) => {
    setMunicipio(linha.municipio);
    setPrestacao(linha.prestacao || '');
    setEmissor(linha.emissor || '');
    setTomador(linha.tomador || '');
    setServico(linha.servico);
    setAliquota(linha.aliquota);
    setRetencao(linha.retencao);
    setIdSelecionado(linha.id);
    setLinhaSelecionada(index);
  };

  const handleInserir = async () => {
    try {
      await axios.post('http://localhost:3001/api/inserir', {
        municipio,
        servico,
        aliquota: parseFloat(aliquota),
        retencao,
        tomador,
        prestacao,
        emissor
      });
      exibirMensagem('✅ Registro inserido com sucesso.');
      limparCampos();
    } catch (err) {
      exibirMensagem('❌ Erro ao inserir registro.');
    }
  };

  const handleAlterar = async () => {
    if (!idSelecionado) return exibirMensagem('⚠️ Selecione uma linha para alterar.');
    try {
      const response = await axios.put('http://localhost:3001/api/alterar', {
        id: idSelecionado,
        municipio,
        servico,
        aliquota: parseFloat(aliquota),
        retencao,
        tomador,
        prestacao,
        emissor
      });
      exibirMensagem(response.data.message);
      limparCampos();
    } catch (err) {
      exibirMensagem('❌ Erro ao alterar registro.');
    }
  };

  const handleExcluir = async () => {
    if (!idSelecionado) return exibirMensagem('⚠️ Selecione uma linha para excluir.');
    const confirmacao = window.confirm('Tem certeza que deseja excluir este registro?');
    if (!confirmacao) return;

    try {
      const response = await axios.delete('http://localhost:3001/api/excluir', {
        data: { id: idSelecionado }
      });
      exibirMensagem(response.data.message);
      limparCampos();
    } catch (err) {
      exibirMensagem('❌ Erro ao excluir registro.');
    }
  };

  const totalPaginas = Math.ceil(resultado.length / porPagina);
  const dadosPaginados = resultado.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  return (
    <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Consulta Completa</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input className="border p-2 rounded" placeholder="Município" value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Prestação" value={prestacao} onChange={(e) => setPrestacao(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Emissor" value={emissor} onChange={(e) => setEmissor(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Tomador" value={tomador} onChange={(e) => setTomador(e.target.value)} />
        <select className="border p-2 rounded" value={servico} onChange={(e) => setServico(e.target.value)}>
          <option value="">Selecione o Serviço</option>
          <option value="16.02">Transporte Municipal - 16.02</option>
          <option value="11.04">Carga e Descarga - 11.04</option>
        </select>
        <input className="border p-2 rounded" placeholder="Alíquota (%)" type="number" value={aliquota} onChange={(e) => setAliquota(e.target.value)} />
        <div className="col-span-3 flex items-center gap-2 mt-2">
          <input type="checkbox" id="retencao" checked={retencao} onChange={(e) => setRetencao(e.target.checked)} className="mr-2" />
          <label htmlFor="retencao" className="font-medium">Há retenção?</label>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <button onClick={handleConsulta} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Consultar</button>
        <button onClick={handleInserir} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">Inserir</button>
        <button onClick={handleAlterar} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Alterar</button>
        <button onClick={handleExcluir} className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800">Excluir</button>
        <button onClick={limparCampos} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Limpar Campos</button>
        <button onClick={handleExportarExcel} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">📥 Exportar Excel</button>
      </div>

      {mensagem && <p className="text-blue-900 font-medium mt-4">{mensagem}</p>}

      {dadosPaginados.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-left border rounded">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2">Município</th>
                <th className="px-4 py-2">Serviço</th>
                <th className="px-4 py-2">Alíquota</th>
                <th className="px-4 py-2">Retenção</th>
                <th className="px-4 py-2">Tomador</th>
                <th className="px-4 py-2">Emissor</th>
                <th className="px-4 py-2">Prestação</th>
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((r, i) => (
                <tr key={i} onClick={() => handleLinhaSelecionada(r, i)} className={`border-t cursor-pointer hover:bg-blue-50 ${linhaSelecionada === i ? 'bg-blue-100 font-semibold' : ''}`}>
                  <td className="px-4 py-2">{r.municipio}</td>
                  <td className="px-4 py-2">{r.servico}</td>
                  <td className="px-4 py-2">{r.aliquota}%</td>
                  <td className="px-4 py-2">{r.retencao ? 'Sim' : 'Não'}</td>
                  <td className="px-4 py-2">{r.tomador || '-'}</td>
                  <td className="px-4 py-2">{r.emissor || '-'}</td>
                  <td className="px-4 py-2">{r.prestacao || '-'}</td>
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

export default PainelCompleto;
