import { useState } from 'react';
import axios from 'axios';

function InserirDados() {
  const [municipio, setMunicipio] = useState('');
  const [servico, setServico] = useState('');
  const [aliquota, setAliquota] = useState('');
  const [retencao, setRetencao] = useState(false);
  const [tomador, setTomador] = useState('');
  const [emissor, setEmissor] = useState('');
  const [prestacao, setPrestacao] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (error) {
      setMensagem('Erro ao inserir: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block font-semibold">Município</label>
        <input
          type="text"
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block font-semibold">Serviço</label>
        <input
          type="text"
          value={servico}
          onChange={(e) => setServico(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block font-semibold">Alíquota (%)</label>
        <input
          type="number"
          step="0.01"
          value={aliquota}
          onChange={(e) => setAliquota(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block font-semibold">Tomador</label>
        <input
          type="text"
          value={tomador}
          onChange={(e) => setTomador(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>
      <div>
        <label className="block font-semibold">Prestação</label>
        <input
          type="text"
          value={prestacao}
          onChange={(e) => setPrestacao(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>
      <div>
        <label className="block font-semibold">Emissor</label>
        <input
          type="text"
          value={emissor}
          onChange={(e) => setEmissor(e.target.value)}
          className="w-full border p-2 rounded"
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
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Inserir
      </button>
      {mensagem && <p className="mt-2 font-medium">{mensagem}</p>}
    </form>
  );
}

export default InserirDados;
