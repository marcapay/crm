/**
 * Motor de Cruzamento Inteligente entre Demandas de Locação e Carteira de Imóveis
 * Araújo Imóveis - Caratinga/MG
 */

/**
 * Normaliza strings para comparação flexível (remove acentos, espaços extras e minúsculas)
 */
function normalizeStr(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Extrai valor numérico de strings financeiras (ex: "R$ 1.800,00" -> 1800)
 */
function parseCurrency(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Converte faixas de preço textuais para valores mínimo e máximo
 */
export function parsePriceRange(rangeStr, customValue = null) {
  if (customValue && Number(customValue) > 0) {
    const val = Number(customValue);
    return { min: val * 0.85, max: val * 1.15, label: `Em torno de R$ ${val.toLocaleString('pt-BR')}` };
  }

  const range = String(rangeStr || '').toLowerCase();

  if (range.includes('500') && (range.includes('ate') || range.includes('menos'))) {
    return { min: 0, max: 600, label: 'Até R$ 500' };
  }
  if (range.includes('500') && range.includes('800')) {
    return { min: 450, max: 900, label: 'R$ 500 a R$ 800' };
  }
  if (range.includes('800') && range.includes('1000')) {
    return { min: 750, max: 1100, label: 'R$ 800 a R$ 1.000' };
  }
  if (range.includes('1000') && range.includes('1500')) {
    return { min: 950, max: 1650, label: 'R$ 1.000 a R$ 1.500' };
  }
  if (range.includes('1500') && range.includes('2000')) {
    return { min: 1400, max: 2200, label: 'R$ 1.500 a R$ 2.000' };
  }
  if (range.includes('2000') && range.includes('3000')) {
    return { min: 1900, max: 3300, label: 'R$ 2.000 a R$ 3.000' };
  }
  if (range.includes('3000') && range.includes('5000')) {
    return { min: 2800, max: 5500, label: 'R$ 3.000 a R$ 5.000' };
  }
  if (range.includes('5000') && (range.includes('acima') || range.includes('mais'))) {
    return { min: 4800, max: 999999, label: 'Acima de R$ 5.000' };
  }

  // Padrão amplo
  return { min: 0, max: 999999, label: 'Aberto a propostas' };
}

/**
 * Calcula a compatibilidade entre uma demanda e um imóvel da carteira
 * @param {object} demanda - Objeto da demanda do cliente
 * @param {object} imovel - Objeto do imóvel (propriedade ou ficha de visita)
 * @returns {object} - Objeto com score, nível de compatibilidade, justificativas e alertas
 */
export function calculateMatch(demanda, imovel) {
  if (!demanda || !imovel) {
    return { score: 0, level: 'baixa', reasons: [], warnings: [] };
  }

  // Verifica se o imóvel está disponível para aluguel / locação
  const finalidadeImovel = normalizeStr(imovel.finalidade || imovel.finalidadeImovel || imovel.modalidadePretendida || '');
  const isAluguel = finalidadeImovel.includes('alug') || finalidadeImovel.includes('loca') || !finalidadeImovel;
  
  if (!isAluguel && finalidadeImovel.includes('venda')) {
    return {
      score: 10,
      level: 'incompativel',
      reasons: [],
      warnings: ['Imóvel cadastrado exclusivamente para Venda (não disponível para Locação)']
    };
  }

  let totalScore = 0;
  const reasons = [];
  const warnings = [];
  let violatedIndispensable = false;

  // 1. TIPO DE IMÓVEL (Até 25 pontos)
  const tiposDesejados = Array.isArray(demanda.tiposImovel) 
    ? demanda.tiposImovel.map(normalizeStr) 
    : [normalizeStr(demanda.tipoImovel || '')];
  
  const tipoImovel = normalizeStr(imovel.tipo || imovel.tipoImovel || '');

  if (tiposDesejados.includes('ainda nao decidi') || tiposDesejados.includes('outro') || tiposDesejados.length === 0) {
    totalScore += 20;
    reasons.push(`Tipo ${imovel.tipo || imovel.tipoImovel || 'Imóvel'} aceito (cliente sem restrição rígida de tipo)`);
  } else {
    const matchTipo = tiposDesejados.some(t => t && (tipoImovel.includes(t) || t.includes(tipoImovel)));
    if (matchTipo) {
      totalScore += 25;
      reasons.push(`Tipo ${imovel.tipo || imovel.tipoImovel} atende exatamente ao solicitado`);
    } else {
      warnings.push(`Tipo do imóvel é ${imovel.tipo || imovel.tipoImovel || 'diferente'}, cliente procurava ${demanda.tiposImovel?.join(', ')}`);
    }
  }

  // 2. LOCALIZAÇÃO (Até 25 pontos)
  const cidadeImovel = normalizeStr(imovel.cidade || 'Caratinga');
  const cidadeDesejada = normalizeStr(demanda.cidade || 'Caratinga');
  const matchCidade = !cidadeDesejada || cidadeImovel.includes(cidadeDesejada) || cidadeDesejada.includes(cidadeImovel);

  const bairrosDesejados = Array.isArray(demanda.bairros) 
    ? demanda.bairros.map(normalizeStr) 
    : [];
  const bairroImovel = normalizeStr(imovel.bairro || '');

  if (!matchCidade) {
    warnings.push(`Cidade diferente (${imovel.cidade || 'Caratinga'} vs ${demanda.cidade || 'Caratinga'})`);
  } else if (demanda.semPreferenciaLocalizacao || bairrosDesejados.length === 0) {
    totalScore += 25;
    reasons.push(`Localizado no bairro ${imovel.bairro || 'Centro'} (cliente sem preferência fixa de bairro)`);
  } else {
    const matchBairro = bairrosDesejados.some(b => b && (bairroImovel.includes(b) || b.includes(bairroImovel)));
    if (matchBairro) {
      totalScore += 25;
      reasons.push(`Localizado no bairro ${imovel.bairro} (um dos bairros preferidos do cliente)`);
    } else if (demanda.aceitaOutrosBairros) {
      totalScore += 14;
      reasons.push(`Bairro ${imovel.bairro || 'próximo'} (cliente informou que aceita outros bairros)`);
    } else {
      warnings.push(`Bairro ${imovel.bairro || 'atual'} não está na lista de preferência do cliente`);
    }
  }

  // 3. ORÇAMENTO (Até 30 pontos)
  const valorImovel = parseCurrency(imovel.valorImovel || imovel.valorPretendido || imovel.valorAluguel || 0);
  const valorCondominio = parseCurrency(imovel.valorCondominio || 0);
  const valorIptu = parseCurrency(imovel.iptuAnual || 0) / 12; // mensalizado

  // Custo total aproximado para o inquilino
  const custoTotalInquilino = demanda.incluiCondominioIptu 
    ? (valorImovel + valorCondominio + valorIptu) 
    : valorImovel;

  const priceRange = parsePriceRange(demanda.orcamentoFaixa, demanda.orcamentoValor);

  if (priceRange.max >= 999999 && priceRange.min === 0) {
    totalScore += 26;
    reasons.push(`Valor de aluguel R$ ${valorImovel.toLocaleString('pt-BR')} (cliente aberto a propostas)`);
  } else if (custoTotalInquilino >= priceRange.min && custoTotalInquilino <= priceRange.max) {
    totalScore += 30;
    reasons.push(`Valor de R$ ${valorImovel.toLocaleString('pt-BR')} dentro do orçamento (${priceRange.label})`);
  } else if (custoTotalInquilino > 0 && custoTotalInquilino <= priceRange.max * 1.15) {
    // Até 15% acima da faixa
    totalScore += 18;
    reasons.push(`Valor de R$ ${valorImovel.toLocaleString('pt-BR')} está próximo da faixa (${priceRange.label})`);
    warnings.push(`Valor R$ ${valorImovel.toLocaleString('pt-BR')} ultrapassa levemente o teto desejado`);
  } else if (custoTotalInquilino > 0 && custoTotalInquilino < priceRange.min) {
    // Mais barato que a faixa
    totalScore += 28;
    reasons.push(`Excelente custo-benefício: R$ ${valorImovel.toLocaleString('pt-BR')} (abaixo do teto orçamentário)`);
  } else {
    warnings.push(`Valor de R$ ${valorImovel.toLocaleString('pt-BR')} fora da faixa pretendida (${priceRange.label})`);
  }

  // 4. CÔMODOS E CARACTERÍSTICAS (Até 20 pontos)
  const minQuartos = parseInt(demanda.quartos || 0, 10);
  const quartosImovel = parseInt(imovel.quartos || 0, 10);
  if (minQuartos > 0) {
    if (quartosImovel >= minQuartos) {
      totalScore += 6;
      reasons.push(`Possui ${quartosImovel} quarto(s) (atende aos ${minQuartos} solicitados)`);
    } else {
      warnings.push(`Possui ${quartosImovel} quarto(s), mas o cliente solicitou no mínimo ${minQuartos}`);
      if (demanda.quartosIndispensavel) {
        violatedIndispensable = true;
        warnings.push(`⚠️ Requisito indispensável não atendido: quantidade de quartos`);
      }
    }
  } else {
    totalScore += 6;
  }

  const minVagas = parseInt(demanda.vagas || 0, 10);
  const vagasImovel = parseInt(imovel.vagas || 0, 10);
  if (minVagas > 0) {
    if (vagasImovel >= minVagas) {
      totalScore += 6;
      reasons.push(`Possui ${vagasImovel} vaga(s) de garagem`);
    } else {
      warnings.push(`Possui ${vagasImovel} vaga(s) de garagem, cliente precisa de ${minVagas}`);
      if (demanda.vagasIndispensavel) {
        violatedIndispensable = true;
        warnings.push(`⚠️ Requisito indispensável não atendido: vaga de garagem`);
      }
    }
  } else {
    totalScore += 6;
  }

  // Diferenciais / Comodidades adicionais
  const diferenciaisDemanda = Array.isArray(demanda.diferenciais) ? demanda.diferenciais : [];
  const diferenciaisImovel = Array.isArray(imovel.diferenciais) 
    ? imovel.diferenciais.map(normalizeStr) 
    : [];

  let matchedDiferenciaisCount = 0;
  diferenciaisDemanda.forEach(dif => {
    const nomeDif = typeof dif === 'object' ? dif.nome : dif;
    const isIndispensavel = typeof dif === 'object' ? dif.indispensavel : false;
    const norm = normalizeStr(nomeDif);

    const hasFeature = diferenciaisImovel.some(d => d.includes(norm) || norm.includes(d)) ||
      normalizeStr(imovel.descricao || '').includes(norm);

    if (hasFeature) {
      matchedDiferenciaisCount++;
      reasons.push(`Conta com ${nomeDif}`);
    } else if (isIndispensavel) {
      violatedIndispensable = true;
      warnings.push(`⚠️ Não atende requisito indispensável: ${nomeDif}`);
    }
  });

  if (diferenciaisDemanda.length > 0) {
    const ratio = matchedDiferenciaisCount / diferenciaisDemanda.length;
    totalScore += Math.round(ratio * 8);
  } else {
    totalScore += 8;
  }

  // Penalização caso requisito indispensável tenha sido violado
  if (violatedIndispensable) {
    totalScore = Math.min(totalScore, 48); // Limita score se faltar item indispensável
  }

  // Normalização do score entre 10 e 98%
  const finalScore = Math.min(Math.max(totalScore, 10), 98);

  let level = 'baixa';
  if (finalScore >= 80) level = 'excelente';
  else if (finalScore >= 65) level = 'alta';
  else if (finalScore >= 45) level = 'media';

  return {
    score: finalScore,
    level,
    reasons: [...new Set(reasons)],
    warnings: [...new Set(warnings)],
    violatedIndispensable
  };
}

/**
 * Encontra todos os imóveis compatíveis para uma determinada demanda
 * Ordena do maior para o menor score
 */
export function findMatchesForDemand(demanda, allProperties = []) {
  if (!demanda || !Array.isArray(allProperties) || allProperties.length === 0) {
    return [];
  }

  const matches = allProperties
    .map(imovel => {
      const matchResult = calculateMatch(demanda, imovel);
      return {
        imovel,
        ...matchResult
      };
    })
    .filter(item => item.score >= 35) // Apenas com relevância mínima
    .sort((a, b) => b.score - a.score);

  return matches;
}

/**
 * Encontra todas as demandas compatíveis para um determinado imóvel recém cadastrado
 */
export function findDemandsForProperty(imovel, allDemands = []) {
  if (!imovel || !Array.isArray(allDemands) || allDemands.length === 0) {
    return [];
  }

  const matches = allDemands
    .filter(d => !['locacao_concluida', 'demanda_encerrada', 'busca_suspensa'].includes(d.status))
    .map(demanda => {
      const matchResult = calculateMatch(demanda, imovel);
      return {
        demanda,
        ...matchResult
      };
    })
    .filter(item => item.score >= 45)
    .sort((a, b) => b.score - a.score);

  return matches;
}
