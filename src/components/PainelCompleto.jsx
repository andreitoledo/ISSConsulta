import React, { useState } from 'react';
import axios from 'axios';

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
  const [idSelecionado, setIdSelecionado] = useState(null);

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
    setIdSelecionado(null);
  };

  const handleConsulta = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/consulta', {
        params: { municipio, servico }
      });
      setResultado(response.data);
      setMensagem(response.data.length === 0 ? 'Nenhum registro encontrado.' : '');
    } catch (err) {
      setMensagem('Erro ao consultar');
    }
  };

  const handleLinhaSelecionada = (linha) => {
    setMunicipio(linha.municipio);
    setPrestacao(linha.prestacao || '');
    setEmissor(linha.emissor || '');
    setTomador(linha.tomador || '');
    setServico(linha.servico);
    setAliquota(linha.aliquota);
    setRetencao(linha.retencao);
    setIdSelecionado(linha.id);
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
    } catch (err) {
      setMensagem('Erro ao inserir registro.');
    }
  };

  const handleAlterar = async () => {
    if (!idSelecionado) return setMensagem('Selecione uma linha para alterar.');
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
      setMensagem(response.data.message);
      limparCampos();
    } catch (err) {
      setMensagem('Erro ao alterar registro.');
    }
  };

  const handleExcluir = async () => {
    if (!idSelecionado) return setMensagem('Selecione uma linha para excluir.');
    const confirmacao = window.confirm('Tem certeza que deseja excluir este registro?');
    if (!confirmacao) return;

    try {
      const response = await axios.delete('http://localhost:3001/api/excluir', {
        data: { id: idSelecionado }
      });
      setMensagem(response.data.message);
      limparCampos();
    } catch (err) {
      setMensagem('Erro ao excluir registro.');
    }
  };

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
        <div className="col-span-3 flex items-center gap-2">
          <input type="checkbox" checked={retencao} onChange={(e) => setRetencao(e.target.checked)} />
          <label className="font-medium">Há retenção?</label>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <button onClick={handleConsulta} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Consultar</button>
        <button onClick={handleInserir} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">Inserir</button>
        <button onClick={handleAlterar} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Alterar</button>
        <button onClick={handleExcluir} className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800">Excluir</button>
        <button onClick={limparCampos} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Limpar Campos</button>
      </div>

      {mensagem && <p className="text-blue-900 font-medium mt-4">{mensagem}</p>}

      {resultado.length > 0 && (
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
              {resultado.map((r, i) => (
                <tr key={i} onClick={() => handleLinhaSelecionada(r)} className="border-t cursor-pointer hover:bg-blue-50">
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
        </div>
      )}
    </div>
  );
}

export default PainelCompleto;
