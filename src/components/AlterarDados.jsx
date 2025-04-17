import { useState } from 'react';
import axios from 'axios';

function AlterarDados() {
  const [id, setId] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [servico, setServico] = useState('');
  const [aliquota, setAliquota] = useState('');
  const [retencao, setRetencao] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:3001/api/alterar', {
        id: parseInt(id),
        municipio,
        servico,
        aliquota: parseFloat(aliquota),
        retencao
      });
      setMensagem(response.data.message);
    } catch (error) {
      setMensagem('Erro ao alterar: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <label className="block font-semibold mb-1">ID do Registro</label>
        <input
          type="number"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Município</label>
        <input
          type="text"
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Serviço</label>
        <input
          type="text"
          value={servico}
          onChange={(e) => setServico(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Alíquota (%)</label>
        <input
          type="number"
          step="0.01"
          value={aliquota}
          onChange={(e) => setAliquota(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={retencao}
          onChange={(e) => setRetencao(e.target.checked)}
        />
        <label>Há retenção?</label>
      </div>
      <button
        type="submit"
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
      >
        Alterar
      </button>
      {mensagem && <p className="text-green-700 font-medium">{mensagem}</p>}
    </form>
  );
}

export default AlterarDados;
