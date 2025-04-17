// PainelConsultaPublica.jsx com ordenação nas colunas
import React, { useState } from 'react';
import axios from 'axios';

function PainelConsultaPublica() {
  const [municipio, setMunicipio] = useState('');
  const [servico, setServico] = useState('');
  const [resultado, setResultado] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [colunaOrdenada, setColunaOrdenada] = useState('');
  const [ordemAsc, setOrdemAsc] = useState(true);
  const porPagina = 10;

  const handleConsulta = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/consulta', {
        params: { municipio, servico }
      });
      setResultado(response.data);
      setPaginaAtual(1);
      if (response.data.length === 0) {
        setMensagem('⚠️ Nenhum registro encontrado.');
      } else {
        setMensagem('');
      }
    } catch (err) {
      setMensagem('❌ Erro ao consultar dados.');
    }
  };

  const handleOrdenar = (coluna) => {
    const mapa = {
      'Município': 'municipio',
      'Serviço': 'servico',
      'Alíquota': 'aliquota',
      'Retenção': 'retencao',
      'Tomador': 'tomador',
      'Emissor': 'emissor',
      'Prestação': 'prestacao'
    };
    const chave = mapa[coluna];
    setColunaOrdenada(coluna);
    setOrdemAsc(colunaOrdenada === coluna ? !ordemAsc : true);

    const ordenar = [...resultado].sort((a, b) => {
      const valA = (a[chave] ?? '').toString().toLowerCase();
      const valB = (b[chave] ?? '').toString().toLowerCase();

      if (!isNaN(valA) && !isNaN(valB)) {
        return ordemAsc ? valA - valB : valB - valA;
      }
      return ordemAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    setResultado(ordenar);
    setPaginaAtual(1);
  };

  const totalPaginas = Math.ceil(resultado.length / porPagina);
  const dadosPaginados = resultado.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  return (
    <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4 text-center">Consulta Pública</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input className="border p-2 rounded" placeholder="Município" value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
        <select className="border p-2 rounded" value={servico} onChange={(e) => setServico(e.target.value)}>
          <option value="">Selecione o Serviço</option>
          <option value="16.02">Transporte Municipal - 16.02</option>
          <option value="11.04">Carga e Descarga - 11.04</option>
        </select>
      </div>

      <button onClick={handleConsulta} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Consultar</button>

      {mensagem && <p className="text-blue-900 font-medium mt-4">{mensagem}</p>}

      {dadosPaginados.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-left border rounded">
            <thead>
              <tr className="bg-gray-100 border-b">
                {['Município', 'Serviço', 'Alíquota', 'Retenção', 'Tomador', 'Emissor', 'Prestação'].map((col, index) => (
                  <th
                    key={index}
                    onClick={() => handleOrdenar(col)}
                    className="px-4 py-2 cursor-pointer hover:underline select-none"
                  >
                    {col}{colunaOrdenada === col && (ordemAsc ? ' ▲' : ' ▼')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((r, i) => (
                <tr key={i} className="border-t">
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

export default PainelConsultaPublica;
