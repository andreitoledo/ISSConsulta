// PainelCompleto.jsx com seleção de linha, paginação, filtro, ordenação e layout responsivo
import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

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
  const [filtro, setFiltro] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [selecionado, setSelecionado] = useState(null);
  const [ordenarPor, setOrdenarPor] = useState('');
  const [ordemAsc, setOrdemAsc] = useState(true);
  const porPagina = 10;

  const limparCampos = () => {
    setMunicipio('');
    setPrestacao('');
    setEmissor('');
    setTomador('');
    setServico('');
    setAliquota('');
    setRetencao(false);
    setMensagem('');
    setResultado([]);
    setFiltro('');
    setSelecionado(null);
  };

  const handleConsulta = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/consulta', {
        params: { municipio, servico, prestacao, tomador, emissor, aliquota }
      });
      setResultado(response.data);
      setMensagem(response.data.length === 0 ? 'Nenhum registro encontrado.' : 'Consulta realizada com sucesso.');
      setPaginaAtual(1);
    } catch (err) {
      setMensagem('Erro ao consultar dados.');
    }
  };

  const handleInserir = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/inserir', {
        municipio,
        servico,
        aliquota: parseFloat(aliquota),
        retencao,
        tomador,
        prestacao,
        emissor
      });
      setMensagem(response.data.message);
      limparCampos();
    } catch (err) {
      setMensagem('Erro ao inserir registro.');
    }
  };

  const handleAlterar = async () => {
    try {
      if (!selecionado || !selecionado.id) return setMensagem('Selecione um registro na tabela.');
      const response = await axios.put('http://localhost:3001/api/alterar', {
        id: selecionado.id,
        municipio,
        servico,
        aliquota: parseFloat(aliquota),
        retencao,
        tomador,
        prestacao,
        emissor
      });
      setMensagem(response.data.message);
      handleConsulta();
    } catch {
      setMensagem('Erro ao alterar registro.');
    }
  };

  const handleExcluir = async () => {
    const confirmar = window.confirm('Deseja realmente excluir este registro?');
    if (!confirmar) return;
    try {
      if (!selecionado || !selecionado.id) return setMensagem('Selecione um registro na tabela.');
      const response = await axios.delete('http://localhost:3001/api/excluir', {
        data: { id: selecionado.id }
      });
      setMensagem(response.data.message);
      limparCampos();
    } catch {
      setMensagem('Erro ao excluir registro.');
    }
  };

  const handleExportarExcel = () => {
    const planilha = XLSX.utils.json_to_sheet(resultado);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, planilha, 'Aliquotas');
    XLSX.writeFile(wb, 'aliquotas.xlsx');
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

  const preencherCampos = (item) => {
    setSelecionado(item);
    setMunicipio(item.municipio || '');
    setPrestacao(item.prestacao || '');
    setEmissor(item.emissor || '');
    setTomador(item.tomador || '');
    setServico(item.servico || '');
    setAliquota(item.aliquota || '');
    setRetencao(item.retencao || false);
  };

  const ordenarColuna = (coluna) => {
    if (ordenarPor === coluna) {
      setOrdemAsc(!ordemAsc);
    } else {
      setOrdenarPor(coluna);
      setOrdemAsc(true);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded shadow max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Painel Completo</h2>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <input className="border rounded px-3 py-2" placeholder="Município" value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Prestação" value={prestacao} onChange={(e) => setPrestacao(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Emissor" value={emissor} onChange={(e) => setEmissor(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Tomador" value={tomador} onChange={(e) => setTomador(e.target.value)} />
        <select className="border rounded px-3 py-2" value={servico} onChange={(e) => setServico(e.target.value)}>
          <option value="">Selecione o Serviço</option>
          <option value="16.02">Transporte Municipal - 16.02</option>
          <option value="11.04">Carga e Descarga - 11.04</option>
        </select>
        <input className="border rounded px-3 py-2" type="number" placeholder="Alíquota (%)" value={aliquota} onChange={(e) => setAliquota(e.target.value)} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input type="checkbox" checked={retencao} onChange={(e) => setRetencao(e.target.checked)} />
        <label className="font-medium">Há retenção?</label>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={handleConsulta} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Consultar</button>
        <button onClick={handleInserir} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">Inserir</button>
        <button onClick={handleAlterar} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Alterar</button>
        <button onClick={handleExcluir} className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800">Excluir</button>
        <button onClick={limparCampos} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Limpar Campos</button>
        <button onClick={handleExportarExcel} className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700">Exportar Excel</button>
      </div>

      <input
        type="text"
        className="border px-3 py-2 rounded w-full mb-4"
        placeholder="Filtrar resultados rapidamente..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      {mensagem && <p className="text-blue-900 font-medium mb-4">{mensagem}</p>}

      {dadosPaginados.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border rounded min-w-[800px]">
            <thead>
              <tr className="bg-gray-100 border-b">
                {['municipio', 'servico', 'aliquota', 'retencao', 'tomador', 'emissor', 'prestacao'].map((coluna) => (
                  <th
                    key={coluna}
                    onClick={() => ordenarColuna(coluna)}
                    className="px-4 py-2 cursor-pointer hover:underline"
                  >
                    {coluna.charAt(0).toUpperCase() + coluna.slice(1)}
                    {ordenarPor === coluna && (ordemAsc ? ' ▲' : ' ▼')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((item, i) => (
                <tr
                  key={i}
                  className={`border-t cursor-pointer ${selecionado?.id === item.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => preencherCampos(item)}
                >
                  <td className="px-4 py-2">{item.municipio}</td>
                  <td className="px-4 py-2">{item.servico}</td>
                  <td className="px-4 py-2">{item.aliquota}%</td>
                  <td className="px-4 py-2">{item.retencao ? 'Sim' : 'Não'}</td>
                  <td className="px-4 py-2">{item.tomador}</td>
                  <td className="px-4 py-2">{item.emissor}</td>
                  <td className="px-4 py-2">{item.prestacao}</td>
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
