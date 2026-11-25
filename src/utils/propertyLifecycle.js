/**
 * ARAÚJO IMÓVEIS - MOTOR DE GESTÃO DO CICLO DE VIDA DE IMÓVEIS
 * Classificação, Acompanhamento, Venda, Locação, Vistorias, Contratos, Assinaturas e Pendências
 */

export const FINALIDADE_IMOVEL = [
  'Para locação',
  'Para venda',
  'Para venda e locação'
];

export const STATUS_COMERCIAL = [
  {
    id: 'disponivel_locacao',
    label: 'Disponível para locação',
    cor: 'Verde',
    hex: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.4)',
    badgeClass: 'badge-success'
  },
  {
    id: 'disponivel_venda',
    label: 'Disponível para venda',
    cor: 'Verde',
    hex: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.4)',
    badgeClass: 'badge-success'
  },
  {
    id: 'disponivel_venda_locacao',
    label: 'Disponível para venda e locação',
    cor: 'Verde',
    hex: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.4)',
    badgeClass: 'badge-success'
  },
  {
    id: 'reservado',
    label: 'Reservado',
    cor: 'Amarelo',
    hex: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)',
    badgeClass: 'badge-warning'
  },
  {
    id: 'em_negociacao',
    label: 'Em negociação',
    cor: 'Azul',
    hex: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    badgeClass: 'badge-info'
  },
  {
    id: 'alugado',
    label: 'Alugado',
    cor: 'Roxo',
    hex: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.4)',
    badgeClass: 'badge-purple'
  },
  {
    id: 'vendido',
    label: 'Vendido',
    cor: 'Roxo',
    hex: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.4)',
    badgeClass: 'badge-purple'
  },
  {
    id: 'temporariamente_indisponivel',
    label: 'Temporariamente indisponível',
    cor: 'Cinza',
    hex: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.35)',
    badgeClass: 'badge-secondary'
  },
  {
    id: 'retirado_da_carteira',
    label: 'Retirado da carteira',
    cor: 'Vermelho',
    hex: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.35)',
    badgeClass: 'badge-danger'
  }
];

export const PIPELINE_LOCACAO_STAGES = [
  { id: '1_cadastro_iniciado', label: '1. Cadastro iniciado', short: 'Cadastro iniciado', step: 1 },
  { id: '2_aguardando_documentacao', label: '2. Aguardando documentação', short: 'Aguardando doc.', step: 2 },
  { id: '3_aguardando_autorizacao', label: '3. Aguardando autorização do proprietário', short: 'Autorização prop.', step: 3 },
  { id: '4_disponivel_divulgacao', label: '4. Disponível para divulgação', short: 'Divulgação aberta', step: 4 },
  { id: '5_em_visitacao', label: '5. Em visitação', short: 'Em visitação', step: 5 },
  { id: '6_proposta_recebida', label: '6. Proposta recebida', short: 'Proposta recebida', step: 6 },
  { id: '7_em_analise_cadastral', label: '7. Em análise cadastral do interessado', short: 'Análise cadastral', step: 7 },
  { id: '8_aguardando_aprovacao_proprietario', label: '8. Aguardando aprovação do proprietário', short: 'Aprovação prop.', step: 8 },
  { id: '9_aguardando_garantia', label: '9. Aguardando garantia locatícia', short: 'Garantia locatícia', step: 9 },
  { id: '10_em_vistoria_entrada', label: '10. Em vistoria de entrada', short: 'Vistoria entrada', step: 10 },
  { id: '11_elaborando_contrato', label: '11. Elaborando contrato', short: 'Elaborando contrato', step: 11 },
  { id: '12_aguardando_assinaturas', label: '12. Aguardando assinaturas', short: 'Aguardando assinaturas', step: 12 },
  { id: '13_aguardando_entrega_chaves', label: '13. Aguardando entrega das chaves', short: 'Entrega de chaves', step: 13 },
  { id: '14_locacao_concluida', label: '14. Locação concluída', short: 'Locação concluída', step: 14 }
];

export const PIPELINE_VENDA_STAGES = [
  { id: '1_cadastro_iniciado', label: '1. Cadastro iniciado', short: 'Cadastro iniciado', step: 1 },
  { id: '2_aguardando_documentacao', label: '2. Aguardando documentação', short: 'Aguardando doc.', step: 2 },
  { id: '3_aguardando_autorizacao', label: '3. Aguardando autorização do proprietário', short: 'Autorização prop.', step: 3 },
  { id: '4_disponivel_divulgacao', label: '4. Disponível para divulgação', short: 'Divulgação aberta', step: 4 },
  { id: '5_em_visitacao', label: '5. Em visitação', short: 'Em visitação', step: 5 },
  { id: '6_proposta_recebida', label: '6. Proposta recebida', short: 'Proposta recebida', step: 6 },
  { id: '7_em_negociacao', label: '7. Em negociação', short: 'Em negociação', step: 7 },
  { id: '8_proposta_aprovada', label: '8. Proposta aprovada', short: 'Proposta aprovada', step: 8 },
  { id: '9_aguardando_documentacao_partes', label: '9. Aguardando documentação das partes', short: 'Documentos partes', step: 9 },
  { id: '10_elaborando_contrato', label: '10. Elaborando contrato', short: 'Elaborando contrato', step: 10 },
  { id: '11_aguardando_assinaturas', label: '11. Aguardando assinaturas', short: 'Aguardando assinaturas', step: 11 },
  { id: '12_aguardando_pagamento_financiamento', label: '12. Aguardando pagamento ou financiamento', short: 'Pagto / Financ.', step: 12 },
  { id: '13_aguardando_transferencia', label: '13. Aguardando formalização da transferência', short: 'Formaliz. transfer.', step: 13 },
  { id: '14_venda_concluida', label: '14. Venda concluída', short: 'Venda concluída', step: 14 }
];

export const STATUS_VISTORIA = [
  { id: 'nao_iniciada', label: 'Vistoria não iniciada', color: '#94a3b8' },
  { id: 'agendada', label: 'Vistoria agendada', color: '#f59e0b' },
  { id: 'em_vistoria_entrada', label: 'Em vistoria de entrada', color: '#3b82f6' },
  { id: 'aguardando_laudo', label: 'Aguardando elaboração do laudo', color: '#818cf8' },
  { id: 'aguardando_assinatura', label: 'Aguardando assinatura da vistoria', color: '#c084fc' },
  { id: 'entrada_concluida', label: 'Vistoria de entrada concluída', color: '#10b981' },
  { id: 'em_vistoria_saida', label: 'Em vistoria de saída', color: '#fb923c' },
  { id: 'saida_concluida', label: 'Vistoria de saída concluída', color: '#10b981' }
];

export const STATUS_OPERACIONAL_POS_LOCACAO = [
  { id: 'contrato_vigente', label: 'Contrato vigente', color: '#10b981', badgeClass: 'badge-success' },
  { id: 'em_renovacao', label: 'Em renovação', color: '#38bdf8', badgeClass: 'badge-info' },
  { id: 'aviso_desocupacao', label: 'Aviso de desocupação', color: '#f59e0b', badgeClass: 'badge-warning' },
  { id: 'em_vistoria_saida', label: 'Em vistoria de saída', color: '#fb923c', badgeClass: 'badge-warning' },
  { id: 'em_manutencao', label: 'Em manutenção', color: '#ef4444', badgeClass: 'badge-danger' },
  { id: 'em_rescisao', label: 'Em rescisão', color: '#f43f5e', badgeClass: 'badge-danger' },
  { id: 'contrato_encerrado', label: 'Contrato encerrado', color: '#64748b', badgeClass: 'badge-secondary' },
  { id: 'liberado_nova_locacao', label: 'Liberado para nova locação', color: '#3b82f6', badgeClass: 'badge-primary' }
];

export const STATUS_ASSINATURA = [
  { id: 'nao_solicitada', label: 'Não solicitada', color: '#94a3b8' },
  { id: 'aguardando_assinatura', label: 'Aguardando assinatura', color: '#f59e0b' },
  { id: 'assinada', label: 'Assinada', color: '#10b981' },
  { id: 'recusada', label: 'Recusada', color: '#ef4444' },
  { id: 'nao_se_aplica', label: 'Não se aplica', color: '#64748b' }
];

/**
 * Retorna as informações visuais de um status comercial
 */
export function getStatusComercialInfo(statusStr) {
  if (!statusStr) return STATUS_COMERCIAL[0];
  const normalized = statusStr.trim().toLowerCase();
  const found = STATUS_COMERCIAL.find(s => s.label.toLowerCase() === normalized || s.id === normalized);
  return found || {
    id: 'disponivel',
    label: statusStr,
    cor: 'Verde',
    hex: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.4)',
    badgeClass: 'badge-success'
  };
}

/**
 * Calcula a barra de progresso de assinaturas obrigatórias de um contrato
 * Não considera o contrato concluído enquanto houver assinaturas obrigatórias pendentes.
 */
export function calculateSignatureProgress(contrato) {
  if (!contrato || !Array.isArray(contrato.signatarios)) {
    return {
      totalObrigatorias: 0,
      assinadasObrigatorias: 0,
      pendentes: 0,
      concluido: false,
      percentual: 0,
      texto: '0 de 0 assinaturas concluídas'
    };
  }

  const obrigatorios = contrato.signatarios.filter(s => s && s.obrigatoria !== false && s.status !== 'Não se aplica');
  const assinadas = obrigatorios.filter(s => s.status === 'Assinada');
  const total = obrigatorios.length;
  const concluidas = assinadas.length;
  const pendentes = total - concluidas;
  const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0;
  const concluido = total > 0 && concluidas === total;

  return {
    totalObrigatorias: total,
    assinadasObrigatorias: concluidas,
    pendentes,
    concluido,
    percentual,
    texto: `${concluidas} de ${total} assinaturas concluídas`
  };
}

/**
 * Validação de conclusão de contrato
 */
export function canCompleteContract(contrato) {
  const progress = calculateSignatureProgress(contrato);
  return progress.concluido && progress.pendentes === 0;
}

/**
 * Regras inteligentes de decisão de publicação no site da Araújo Imóveis
 */
export function getSitePublishDecision(imovel) {
  if (!imovel) return { publicar: false, motivo: 'Imóvel inexistente', transaction: 'ambos', reservado: false };

  const status = (imovel.statusComercial || imovel.status || '').trim();
  const finalidade = (imovel.finalidadeImovel || 'Para locação').trim();
  const autorizado = imovel.publicarNoSite !== false;

  // Se retirado da carteira ou indisponível
  if (status === 'Retirado da carteira' || status === 'Temporariamente indisponível' || status === 'Cancelado') {
    return {
      publicar: false,
      motivo: `Imóvel ${status.toLowerCase()} não deve ser divulgado no site`,
      despublicar: true
    };
  }

  // Se vendido
  if (status === 'Vendido') {
    if (finalidade === 'Para venda') {
      return { publicar: false, motivo: 'Imóvel vendido retirado do site', despublicar: true };
    }
    if (finalidade === 'Para venda e locação') {
      // Mantém apenas para locação
      return {
        publicar: autorizado,
        transaction: 'alugar',
        reservado: false,
        motivo: 'Imóvel vendido; mantido no site apenas para locação'
      };
    }
  }

  // Se alugado
  if (status === 'Alugado') {
    if (finalidade === 'Para locação') {
      return { publicar: false, motivo: 'Imóvel alugado retirado do site', despublicar: true };
    }
    if (finalidade === 'Para venda e locação') {
      // Mantém apenas para venda
      return {
        publicar: autorizado,
        transaction: 'comprar',
        reservado: false,
        motivo: 'Imóvel alugado; mantido no site apenas para venda'
      };
    }
  }

  // Se reservado
  if (status === 'Reservado') {
    return {
      publicar: autorizado,
      reservado: true,
      transaction: finalidade === 'Para venda' ? 'comprar' : finalidade === 'Para locação' ? 'alugar' : 'ambos',
      motivo: 'Exibir no site com identificação visual de "Reservado"'
    };
  }

  // Se disponível ou em negociação
  let transactionMode = 'alugar';
  if (finalidade === 'Para venda') transactionMode = 'comprar';
  else if (finalidade === 'Para venda e locação') transactionMode = 'ambos';

  return {
    publicar: autorizado,
    reservado: false,
    transaction: transactionMode,
    motivo: autorizado ? 'Disponível e autorizado para divulgação' : 'Publicação desativada pelo administrador'
  };
}

/**
 * Central de Pendências Administrativa:
 * Identifica automaticamente documentos faltantes, assinaturas pendentes,
 * vistorias em aberto, dados incompletos, contratos vencendo e cadastros sem fotos.
 */
export function detectPendencias(imoveis = [], contratos = [], vistorias = []) {
  const pendencias = [];

  const now = new Date();
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;

  // 1. Varredura dos Imóveis
  imoveis.forEach(imovel => {
    if (!imovel) return;
    const codigo = imovel.codigoImovel || imovel.code || `IM-${imovel.id}`;
    const titulo = imovel.tituloImovel || imovel.title || `${imovel.tipoImovel || imovel.type} no ${imovel.bairroImovel || imovel.neighborhood || 'Centro'}`;
    const responsavel = imovel.corretorResponsavel || imovel.profissionalResponsavel || 'Corretor Geral';

    // A) Imóveis sem fotografias
    const fotos = imovel.imagensImovel || imovel.images || [];
    if (!Array.isArray(fotos) || fotos.length === 0) {
      pendencias.push({
        id: `pend_foto_${imovel.id}`,
        tipo: 'sem_fotos',
        categoria: 'Fotos & Mídias',
        titulo: `Imóvel sem fotografias: ${codigo}`,
        descricao: `${titulo} não possui fotos cadastradas. Fotos de boa qualidade são essenciais para divulgação e vistorias.`,
        imovelId: imovel.id,
        imovelCodigo: codigo,
        responsavel,
        prioridade: 'Alta',
        prazo: 'Em 48 horas',
        acaoTexto: 'Adicionar Fotos',
        modulo: 'imoveis'
      });
    }

    // B) Documentos faltantes do imóvel
    const doc = imovel.documentacao || imovel.details?.documentacao || {};
    const docFaltando = [];
    if (!doc.matriculaIndividual && !doc.escrituraPublica && !imovel.matricula) docFaltando.push('Matrícula / Escritura');
    if (!doc.habiteSe && imovel.tipoImovel !== 'Terreno' && imovel.tipoImovel !== 'Chácara') docFaltando.push('Habite-se');
    
    if (docFaltando.length > 0) {
      pendencias.push({
        id: `pend_doc_${imovel.id}`,
        tipo: 'documento_faltante',
        categoria: 'Documentação',
        titulo: `Documentos pendentes: ${codigo}`,
        descricao: `Faltam comprovantes: ${docFaltando.join(', ')}. Necessário regularizar para segurança jurídica da negociação.`,
        imovelId: imovel.id,
        imovelCodigo: codigo,
        responsavel,
        prioridade: 'Média',
        prazo: 'Em 7 dias',
        acaoTexto: 'Ver Documentação',
        modulo: 'imoveis'
      });
    }

    // C) Dados bancários incompletos para repasse de locação
    const finalidade = imovel.finalidadeImovel || '';
    if (finalidade.includes('locação') || finalidade.includes('alugar')) {
      const dadosBancarios = imovel.dadosBancarios || imovel.details?.dadosBancarios;
      if (!dadosBancarios || (!dadosBancarios.chavePix && !dadosBancarios.conta)) {
        pendencias.push({
          id: `pend_banco_${imovel.id}`,
          tipo: 'dados_bancarios_incompletos',
          categoria: 'Financeiro',
          titulo: `Dados bancários incompletos: ${codigo}`,
          descricao: `O proprietário de ${codigo} não informou dados bancários/PIX para liquidação dos repasses mensais de aluguel.`,
          imovelId: imovel.id,
          imovelCodigo: codigo,
          responsavel: 'Financeiro / Administração',
          prioridade: 'Média',
          prazo: 'Antes do 1º repasse',
          acaoTexto: 'Completar Dados',
          modulo: 'imoveis'
        });
      }
    }

    // D) Cadastro incompleto (sem valor de locação ou venda)
    const preco = Number(imovel.valorImovel || imovel.price || imovel.valorPretendidoAluguel || 0);
    if (!preco || preco <= 0) {
      pendencias.push({
        id: `pend_cadastro_${imovel.id}`,
        tipo: 'cadastro_incompleto',
        categoria: 'Cadastro',
        titulo: `Cadastro sem valor definido: ${codigo}`,
        descricao: `O imóvel não tem valor de aluguel ou venda preenchido, impossibilitando a postagem e os cálculos contratuais.`,
        imovelId: imovel.id,
        imovelCodigo: codigo,
        responsavel,
        prioridade: 'Alta',
        prazo: 'Urgente',
        acaoTexto: 'Definir Valor',
        modulo: 'imoveis'
      });
    }

    // E) Imóveis aguardando autorização para publicação
    if (imovel.etapaPipeline === '3_aguardando_autorizacao' || imovel.statusComercial === 'Temporariamente indisponível') {
      pendencias.push({
        id: `pend_autorizacao_${imovel.id}`,
        tipo: 'aguardando_autorizacao',
        categoria: 'Jurídico / Captação',
        titulo: `Autorização pendente do proprietário: ${codigo}`,
        descricao: `Aguardando termo de autorização assinado pelo proprietário para liberar a divulgação nos portais e site oficial.`,
        imovelId: imovel.id,
        imovelCodigo: codigo,
        responsavel,
        prioridade: 'Alta',
        prazo: 'Em 3 dias',
        acaoTexto: 'Cobrar Autorização',
        modulo: 'imoveis'
      });
    }
  });

  // 2. Varredura dos Contratos
  contratos.forEach(c => {
    if (!c) return;
    const progress = calculateSignatureProgress(c);
    const codigoImovel = c.imovelCodigo || c.propertyId || 'Imóvel';
    const responsavel = c.responsavel || 'Setor de Contratos';

    // A) Contratos aguardando assinaturas
    if (!progress.concluido && progress.pendentes > 0) {
      pendencias.push({
        id: `pend_ass_${c.id}`,
        tipo: 'contrato_aguardando_assinatura',
        categoria: 'Contratos & Assinaturas',
        titulo: `Assinaturas pendentes: Contrato ${c.numero || c.id} (${codigoImovel})`,
        descricao: `${progress.texto}. É obrigatório coletar todas as assinaturas das partes antes de formalizar as chaves.`,
        imovelId: c.imovelId,
        imovelCodigo: codigoImovel,
        contratoId: c.id,
        responsavel,
        prioridade: 'Alta',
        prazo: 'Urgente',
        acaoTexto: 'Coletar Assinaturas',
        modulo: 'contratos'
      });
    }

    // B) Contratos próximos do vencimento (<= 60 dias)
    if (c.dataVencimento && c.status !== 'encerrado' && c.status !== 'rescisao') {
      const vencDate = new Date(c.dataVencimento);
      const diffMs = vencDate - now;
      if (diffMs > 0 && diffMs <= sixtyDaysMs) {
        const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        pendencias.push({
          id: `pend_venc_${c.id}`,
          tipo: 'contrato_proximo_vencimento',
          categoria: 'Renovação / Pós-Locação',
          titulo: `Contrato a vencer em ${diasRestantes} dias: ${codigoImovel}`,
          descricao: `Contrato ${c.numero || c.id} vence em ${new Date(c.dataVencimento).toLocaleDateString('pt-BR')}. Iniciar contato para renovação ou alinhamento de desocupação.`,
          imovelId: c.imovelId,
          imovelCodigo: codigoImovel,
          contratoId: c.id,
          responsavel,
          prioridade: diasRestantes <= 20 ? 'Alta' : 'Média',
          prazo: `${diasRestantes} dias restantes`,
          acaoTexto: 'Iniciar Renovação',
          modulo: 'contratos'
        });
      }
    }
  });

  // 3. Varredura de Vistorias
  vistorias.forEach(v => {
    if (!v) return;
    if (v.status !== 'entrada_concluida' && v.status !== 'saida_concluida' && v.status !== 'Vistoria de entrada concluída' && v.status !== 'Vistoria de saída concluída') {
      const codigoImovel = v.imovelCodigo || 'Imóvel';
      pendencias.push({
        id: `pend_vist_${v.id}`,
        tipo: 'vistoria_pendente',
        categoria: 'Vistorias Técnicas',
        titulo: `Vistoria pendente: ${v.tipo === 'saida' ? 'Saída' : 'Entrada'} (${codigoImovel})`,
        descricao: `Status atual: "${v.status}". Laudo e fotos técnicas pendentes para resguardo do imóvel e liberação de chaves.`,
        imovelId: v.imovelId,
        imovelCodigo: codigoImovel,
        vistoriaId: v.id,
        responsavel: v.profissionalResponsavel || 'Avaliador Técnico',
        prioridade: 'Alta',
        prazo: 'Em 24 horas',
        acaoTexto: 'Concluir Vistoria',
        modulo: 'vistorias'
      });
    }
  });

  return pendencias;
}

/**
 * Criação inicial de signatários padrão para contrato de locação
 */
export function createDefaultLocacaoSignatarios(proprietario, inquilino) {
  return [
    {
      id: 'sig_locador',
      papel: 'Locador (Proprietário)',
      nome: proprietario?.nome || 'Proprietário do Imóvel',
      email: proprietario?.email || '',
      telefone: proprietario?.telefone || '',
      obrigatoria: true,
      status: 'Aguardando assinatura',
      dataAssinatura: null,
      documentoUrl: ''
    },
    {
      id: 'sig_locatario',
      papel: 'Locatário (Inquilino)',
      nome: inquilino?.nome || 'Inquilino Interessado',
      email: inquilino?.email || '',
      telefone: inquilino?.telefone || '',
      obrigatoria: true,
      status: 'Aguardando assinatura',
      dataAssinatura: null,
      documentoUrl: ''
    },
    {
      id: 'sig_imobiliaria',
      papel: 'Imobiliária (Intermediadora)',
      nome: 'Araújo Imóveis Caratinga',
      email: 'contato@araujoimoveiscaratinga.com.br',
      telefone: '(33) 3321-0000',
      obrigatoria: true,
      status: 'Aguardando assinatura',
      dataAssinatura: null,
      documentoUrl: ''
    },
    {
      id: 'sig_fiador',
      papel: 'Fiador Solidário',
      nome: 'A Definir',
      email: '',
      telefone: '',
      obrigatoria: false,
      status: 'Não se aplica',
      dataAssinatura: null,
      documentoUrl: ''
    },
    {
      id: 'sig_testemunha_1',
      papel: 'Testemunha 1',
      nome: 'Testemunha Araújo Imóveis',
      email: '',
      telefone: '',
      obrigatoria: false,
      status: 'Aguardando assinatura',
      dataAssinatura: null,
      documentoUrl: ''
    },
    {
      id: 'sig_testemunha_2',
      papel: 'Testemunha 2',
      nome: 'Testemunha das Partes',
      email: '',
      telefone: '',
      obrigatoria: false,
      status: 'Aguardando assinatura',
      dataAssinatura: null,
      documentoUrl: ''
    }
  ];
}

/**
 * Criação inicial de signatários padrão para contrato de venda
 */
export function createDefaultVendaSignatarios(vendedor, comprador) {
  return [
    {
      id: 'sig_vendedor',
      papel: 'Vendedor (Proprietário)',
      nome: vendedor?.nome || 'Vendedor',
      email: vendedor?.email || '',
      telefone: vendedor?.telefone || '',
      obrigatoria: true,
      status: 'Aguardando assinatura',
      dataAssinatura: null,
      documentoUrl: ''
    },
    {
      id: 'sig_comprador',
      papel: 'Comprador',
      nome: comprador?.nome || 'Comprador Adquirente',
      email: comprador?.email || '',
      telefone: comprador?.telefone || '',
      obrigatoria: true,
      status: 'Aguardando assinatura',
      dataAssinatura: null,
      documentoUrl: ''
    },
    {
      id: 'sig_conjuge_vendedor',
      papel: 'Cônjuge do Vendedor (Outorga)',
      nome: 'Cônjuge Vendedor',
      email: '',
      telefone: '',
      obrigatoria: false,
      status: 'Não se aplica',
      dataAssinatura: null,
      documentoUrl: ''
    },
    {
      id: 'sig_conjuge_comprador',
      papel: 'Cônjuge do Comprador',
      nome: 'Cônjuge Comprador',
      email: '',
      telefone: '',
      obrigatoria: false,
      status: 'Não se aplica',
      dataAssinatura: null,
      documentoUrl: ''
    },
    {
      id: 'sig_imobiliaria',
      papel: 'Imobiliária Intermediadora',
      nome: 'Araújo Imóveis Caratinga',
      email: 'contato@araujoimoveiscaratinga.com.br',
      telefone: '(33) 3321-0000',
      obrigatoria: true,
      status: 'Aguardando assinatura',
      dataAssinatura: null,
      documentoUrl: ''
    },
    {
      id: 'sig_testemunhas',
      papel: 'Testemunhas Instrumentais',
      nome: 'Testemunhas Oficiais',
      email: '',
      telefone: '',
      obrigatoria: false,
      status: 'Não solicitada',
      dataAssinatura: null,
      documentoUrl: ''
    }
  ];
}
