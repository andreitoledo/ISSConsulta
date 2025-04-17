import React, { useState } from 'react';
import axios from 'axios';

function PainelConsultaPublica() {
  const [municipio, setMunicipio] = useState('');
  const [servico, setServico] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mensagem, setMensagem] = useState('');

  const handleConsulta = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/consulta', {
        params: { municipio, servico }
      });
      if (response.data.length === 0) {
        setResultados([]);
        setMensagem('Nenhum registro encontrado.');
      } else {
        setResultados(response.data);
        setMensagem('');
      }
    } catch (err) {
      setResultados([]);
      setMensagem('Erro ao consultar os dados.');
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded shadow space-y-4 ml-4">
      <h2 className="text-xl font-semibold mb-4">Consulta Pública de Alíquota de ISS</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Município</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            placeholder="Digite o município"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Tipo de Serviço</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={servico}
            onChange={(e) => setServico(e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="16.02">Transporte Municipal - 16.02</option>
            <option value="11.04">Carga e Descarga - 11.04</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleConsulta}
        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 mt-4"
      >
        Consultar
      </button>

      {mensagem && <p className="text-red-600 font-medium mt-4">{mensagem}</p>}

      {resultados.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded border overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b text-gray-700">
                <th className="py-2 px-4">Tomador</th>
                <th className="py-2 px-4">Emissor</th>
                <th className="py-2 px-4">Município</th>
                <th className="py-2 px-4">Serviço</th>
                <th className="py-2 px-4">Alíquota</th>
                <th className="py-2 px-4">Retenção</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">{item.tomador || '-'}</td>
                  <td className="py-2 px-4">{item.emissor || '-'}</td>
                  <td className="py-2 px-4">{item.municipio}</td>
                  <td className="py-2 px-4">{item.servico}</td>
                  <td className="py-2 px-4">{item.aliquota}%</td>
                  <td className="py-2 px-4">{item.retencao ? 'Sim' : 'Não'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PainelConsultaPublica;
