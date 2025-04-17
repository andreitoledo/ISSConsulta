import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function PainelCompleto() {
  const [municipio, setMunicipio] = useState('');
  const [servico, setServico] = useState('');
  const [aliquota, setAliquota] = useState('');
  const [retencao, setRetencao] = useState(false);
  const [tomador, setTomador] = useState('');
  const [prestacao, setPrestacao] = useState('');
  const [emissor, setEmissor] = useState('');
  const [resultado, setResultado] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [filtro, setFiltro] = useState('');
  const [linhaSelecionada, setLinhaSelecionada] = useState(null);
  const [ordenarPor, setOrdenarPor] = useState('');
  const [ordemAsc, setOrdemAsc] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const porPagina = 10;

  const limparCampos = () => {
    setMunicipio('');
    setServico('');
    setAliquota('');
    setRetencao(false);
    setTomador('');
    setPrestacao('');
    setEmissor('');
    setMensagem('');
    setLinhaSelecionada(null);
  };

  const handleConsulta = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/consulta', {
        params: { municipio, servico, tomador, prestacao, emissor, aliquota }
      });
      setResultado(response.data);
      setMensagem(response.data.length > 0 ? 'Consulta realizada com sucesso.' : 'Nenhum registro encontrado.');
      setPaginaAtual(1);
    } catch (err) {
      setMensagem('Erro ao consultar dados.');
    }
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
      setMensagem('Registro inserido com sucesso.');
      limparCampos();
      handleConsulta();
    } catch (err) {
      setMensagem('Erro ao inserir registro.');
    }
  };

  const handleAlterar = async () => {
    if (!linhaSelecionada) return setMensagem('Selecione uma linha para alterar.');
    try {
      await axios.put('http://localhost:3001/api/alterar', {
        id: linhaSelecionada.id,
        municipio,
        servico,
        aliquota: parseFloat(aliquota),
        retencao,
        tomador,
        prestacao,
        emissor
      });
      setMensagem('Registro alterado com sucesso.');
      limparCampos();
      handleConsulta();
    } catch (err) {
      setMensagem('Erro ao alterar registro.');
    }
  };

  const handleExcluir = async () => {
    if (!linhaSelecionada) return setMensagem('Selecione uma linha para excluir.');
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
      await axios.delete('http://localhost:3001/api/excluir', {
        data: { id: linhaSelecionada.id }
      });
      setMensagem('Registro excluído com sucesso.');
      limparCampos();
      handleConsulta();
    } catch (err) {
      setMensagem('Erro ao excluir registro.');
    }
  };

  const selecionarLinha = (linha) => {
    setLinhaSelecionada(linha);
    setMunicipio(linha.municipio);
    setServico(linha.servico);
    setAliquota(linha.aliquota);
    setRetencao(linha.retencao);
    setTomador(linha.tomador || '');
    setPrestacao(linha.prestacao || '');
    setEmissor(linha.emissor || '');
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
    XLSX.writeFile(wb, 'consulta_completa.xlsx');
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-xl font-bold mb-4">Painel Completo</h2>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <input value={municipio} onChange={(e) => setMunicipio(e.target.value)} className="border px-3 py-2 rounded" placeholder="Município" />
        <input value={prestacao} onChange={(e) => setPrestacao(e.target.value)} className="border px-3 py-2 rounded" placeholder="Prestação" />
        <input value={emissor} onChange={(e) => setEmissor(e.target.value)} className="border px-3 py-2 rounded" placeholder="Emissor" />
        <input value={tomador} onChange={(e) => setTomador(e.target.value)} className="border px-3 py-2 rounded" placeholder="Tomador" />
        <select value={servico} onChange={(e) => setServico(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Selecione o Serviço</option>
          <option value="16.02">Transporte Municipal - 16.02</option>
          <option value="11.04">Carga e Descarga - 11.04</option>
        </select>
        <input value={aliquota} onChange={(e) => setAliquota(e.target.value)} className="border px-3 py-2 rounded" placeholder="Alíquota (%)" />
        <div className="col-span-3 flex items-center gap-2">
          <input type="checkbox" id="retencao" checked={retencao} onChange={(e) => setRetencao(e.target.checked)} />
          <label htmlFor="retencao" className="font-medium">Há retenção?</label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={handleConsulta} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Consultar</button>
        <button onClick={handleInserir} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">Inserir</button>
        <button onClick={handleAlterar} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Alterar</button>
        <button onClick={handleExcluir} className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800">Excluir</button>
        <button onClick={limparCampos} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Limpar Campos</button>
        <button onClick={handleExportarExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-auto">Exportar Excel</button>
      </div>

      {mensagem && <p className="text-blue-800 mb-2">{mensagem}</p>}

      <input
        type="text"
        placeholder="Filtrar resultados rapidamente..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="border px-3 py-2 rounded w-full mb-4"
      />

      {resultado.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                {['tomador', 'emissor', 'municipio', 'servico', 'aliquota', 'retencao', 'prestacao'].map((col) => (
                  <th key={col} onClick={() => ordenarColuna(col)} className="px-4 py-2 border cursor-pointer">
                    {col.charAt(0).toUpperCase() + col.slice(1)} {ordenarPor === col && (ordemAsc ? '▲' : '▼')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => selecionarLinha(item)}
                  className={`cursor-pointer ${linhaSelecionada?.id === item.id ? 'bg-blue-100' : ''}`}
                >
                  <td className="border px-4 py-1">{item.tomador || '-'}</td>
                  <td className="border px-4 py-1">{item.emissor || '-'}</td>
                  <td className="border px-4 py-1">{item.municipio}</td>
                  <td className="border px-4 py-1">{item.servico}</td>
                  <td className="border px-4 py-1">{item.aliquota}%</td>
                  <td className="border px-4 py-1">{item.retencao ? 'Sim' : 'Não'}</td>
                  <td className="border px-4 py-1">{item.prestacao || '-'}</td>
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

export default PainelCompleto;
