import React, { useState } from 'react';
import axios from 'axios';

function PainelConsultaPublica() {
  const [municipio, setMunicipio] = useState('');
  const [servico, setServico] = useState('');
  const [resultado, setResultado] = useState([]);
  const [mensagem, setMensagem] = useState('');

  const handleConsulta = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/consulta', {
        params: { municipio, servico }
      });
      setResultado(response.data);
      if (response.data.length === 0) {
        setMensagem('Nenhum registro encontrado.');
      } else {
        setMensagem('');
      }
    } catch (err) {
      setMensagem('Erro ao consultar');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-700">Consulta Pública de Alíquota de ISS</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">Município</label>
          <input className="w-full border p-2 rounded" value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold">Tipo de Serviço</label>
          <select className="w-full border p-2 rounded" value={servico} onChange={(e) => setServico(e.target.value)}>
            <option value="">Selecione</option>
            <option value="16.02">Transporte Municipal - 16.02</option>
            <option value="11.04">Carga e Descarga - 11.04</option>
          </select>
        </div>
      </div>
      <div className="text-center mt-6">
        <button onClick={handleConsulta} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Consultar</button>
      </div>

      {mensagem && <p className="text-center text-blue-800 mt-4 font-medium">{mensagem}</p>}

      {resultado.length > 0 && (
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
              {resultado.map((r, i) => (
                <tr key={i} className="border-t">
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
        </div>
      )}
    </div>
  );
}

export default PainelConsultaPublica;
