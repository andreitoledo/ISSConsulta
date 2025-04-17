import { useState } from 'react';
import axios from 'axios';

export default function ConsultarDados() {
  const [municipio, setMunicipio] = useState('');
  const [servico, setServico] = useState('');
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  const handleConsulta = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/consulta', {
        params: { municipio, servico }
      });
      setResultado(response.data);
      setErro('');
    } catch (err) {
      setResultado(null);
      setErro(err.response?.data?.message || 'Erro ao consultar');
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <label className="block font-semibold mb-1">Município</label>
          <input
            type="text"
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Serviço</label>
          <input
            type="text"
            value={servico}
            onChange={(e) => setServico(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
      </div>
      <button
        onClick={handleConsulta}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
      >
        Consultar
      </button>

      {erro && (
        <p className="text-red-600 font-medium">{erro}</p>
      )}

      {resultado && (
        <div className="bg-green-100 p-4 rounded">
          <p><strong>Município:</strong> {resultado.municipio}</p>
          <p><strong>Serviço:</strong> {resultado.servico}</p>
          <p><strong>Alíquota:</strong> {resultado.aliquota}</p>
          <p><strong>Retenção:</strong> {resultado.retencao ? 'Sim' : 'Não'}</p>
        </div>
      )}
    </div>
  );
}
