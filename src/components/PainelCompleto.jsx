import React, { useState } from 'react';
import axios from 'axios';

function PainelCompleto() {
  const [municipio, setMunicipio] = useState('');
  const [servico, setServico] = useState('');
  const [aliquota, setAliquota] = useState('');
  const [retencao, setRetencao] = useState(false);
  const [tomador, setTomador] = useState('');
  const [emissor, setEmissor] = useState('');
  const [prestacao, setPrestacao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [resultados, setResultados] = useState([]);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);

  const limparCampos = () => {
    setMunicipio('');
    setServico('');
    setAliquota('');
    setRetencao(false);
    setTomador('');
    setEmissor('');
    setPrestacao('');
    setMensagem('');
    setResultados([]);
    setRegistroSelecionado(null);
  };

  const handleConsulta = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/consulta', {
        params: {
          municipio,
          servico
        }
      });
      setResultados(response.data);
      if (response.data.length === 0) {
        setMensagem('Nenhum registro encontrado.');
      } else {
        setMensagem('');
      }
    } catch (err) {
      setResultados([]);
      setMensagem('Erro ao consultar os dados.');
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
        emissor,
        prestacao
      });
      setMensagem(response.data.message);
    } catch (err) {
      setMensagem('Erro ao inserir registro.');
    }
  };

  const handleAlterar = async () => {
    const id = registroSelecionado?.id;
    if (!id) return setMensagem('É necessário selecionar um registro da tabela para alterar.');

    try {
      const response = await axios.put('http://localhost:3001/api/alterar', {
        id,
        municipio,
        servico,
        aliquota: parseFloat(aliquota),
        retencao,
        tomador,
        emissor,
        prestacao
      });
      setMensagem(response.data.message);
      handleConsulta();
    } catch (err) {
      setMensagem('Erro ao alterar registro.');
    }
  };

  const handleExcluir = async () => {
    const id = registroSelecionado?.id;
    if (!id) return setMensagem('É necessário selecionar um registro da tabela para excluir.');

    const confirmacao = window.confirm("Tem certeza que deseja excluir este registro?");
    if (!confirmacao) return;

    try {
      const response = await axios.delete('http://localhost:3001/api/excluir', {
        data: { id }
      });
      setMensagem(response.data.message);
      handleConsulta();
    } catch (err) {
      setMensagem('Erro ao excluir registro.');
    }
  };

  const selecionarRegistro = (registro) => {
    setRegistroSelecionado(registro);
    setMunicipio(registro.municipio);
    setServico(registro.servico);
    setAliquota(registro.aliquota);
    setRetencao(registro.retencao);
    setTomador(registro.tomador || '');
    setEmissor(registro.emissor || '');
    setPrestacao(registro.prestacao || '');
  };

  return (
    <div className="bg-gray-50 p-6 rounded shadow space-y-4 ml-4">
      <h2 className="text-xl font-semibold mb-4">Consulta Completa de Alíquota</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block font-semibold">Município</label>
          <input className="w-full border p-2 rounded" value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold">Serviço</label>
          <select className="w-full border p-2 rounded" value={servico} onChange={(e) => setServico(e.target.value)}>
            <option value="">Selecione</option>
            <option value="16.02">Transporte Municipal - 16.02</option>
            <option value="11.04">Carga e Descarga - 11.04</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold">Alíquota</label>
          <input className="w-full border p-2 rounded" value={aliquota} onChange={(e) => setAliquota(e.target.value)} />
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" checked={retencao} onChange={(e) => setRetencao(e.target.checked)} />
          <label>Há retenção?</label>
        </div>
        <div>
          <label className="block font-semibold">Tomador</label>
          <input className="w-full border p-2 rounded" value={tomador} onChange={(e) => setTomador(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold">Emissor</label>
          <input className="w-full border p-2 rounded" value={emissor} onChange={(e) => setEmissor(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold">Prestação</label>
          <input className="w-full border p-2 rounded" value={prestacao} onChange={(e) => setPrestacao(e.target.value)} />
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

      {resultados.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded border overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b text-gray-700">
                <th className="py-2 px-4">Município</th>
                <th className="py-2 px-4">Serviço</th>
                <th className="py-2 px-4">Alíquota</th>
                <th className="py-2 px-4">Retenção</th>
                <th className="py-2 px-4">Tomador</th>
                <th className="py-2 px-4">Emissor</th>
                <th className="py-2 px-4">Prestação</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((item, index) => (
                <tr key={index} className="border-b cursor-pointer hover:bg-blue-50" onClick={() => selecionarRegistro(item)}>
                  <td className="py-2 px-4">{item.municipio}</td>
                  <td className="py-2 px-4">{item.servico}</td>
                  <td className="py-2 px-4">{item.aliquota}%</td>
                  <td className="py-2 px-4">{item.retencao ? 'Sim' : 'Não'}</td>
                  <td className="py-2 px-4">{item.tomador || '-'}</td>
                  <td className="py-2 px-4">{item.emissor || '-'}</td>
                  <td className="py-2 px-4">{item.prestacao || '-'}</td>
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
