// PainelConsultaPublica.jsx atualizado com mensagens e clique em linha
import React, { useState } from 'react';
import axios from 'axios';

function PainelConsultaPublica() {
  const [municipio, setMunicipio] = useState('');
  const [servico, setServico] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [linhaSelecionada, setLinhaSelecionada] = useState(null);

  const exibirMensagem = (texto) => {
    setMensagem(texto);
    setTimeout(() => setMensagem(''), 4000);
  };

  const consultar = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/consulta', {
        params: { municipio, servico }
      });
      setResultados(response.data);
      setMensagem(response.data.length === 0 ? '⚠️ Nenhum registro encontrado.' : '');
    } catch (error) {
      exibirMensagem('❌ Erro ao consultar dados.');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">Consulta Pública</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input className="border p-2 rounded" placeholder="Município" value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
        <select className="border p-2 rounded" value={servico} onChange={(e) => setServico(e.target.value)}>
          <option value="">Selecione o Serviço</option>
          <option value="16.02">Transporte Municipal - 16.02</option>
          <option value="11.04">Carga e Descarga - 11.04</option>
        </select>
        <button onClick={consultar} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Consultar</button>
      </div>

      {mensagem && <p className="text-blue-900 font-medium mt-4">{mensagem}</p>}

      {resultados.length > 0 && (
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
              {resultados.map((r, i) => (
                <tr
                  key={i}
                  onClick={() => setLinhaSelecionada(i)}
                  className={`border-t cursor-pointer hover:bg-blue-50 ${linhaSelecionada === i ? 'bg-blue-100 font-semibold' : ''}`}
                >
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
