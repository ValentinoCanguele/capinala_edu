import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AlunoFinanceiro } from '@/data/escola/queries';

export const exportFinanceiroPDF = (alunos: AlunoFinanceiro[]) => {
    const doc = new jsPDF('portrait', 'pt', 'A4');

    // Formatador
    const formatKz = (valor: number) => {
        return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(valor);
    };

    // Margens e configurações
    const marginX = 40;
    let currentY = 40;

    // Cabeçalho da Escola
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138); // Azul escuro
    doc.text('INSTITUTO CAPIÑALA', marginX, currentY);

    currentY += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text('Ano Letivo: 2026/2027 | Relatório Oficial do Ministério da Educação (Angola)', marginX, currentY);

    currentY += 15;
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-AO')} às ${new Date().toLocaleTimeString('pt-AO')}`, marginX, currentY);

    // Linha divisória
    currentY += 20;
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(1);
    doc.line(marginX, currentY, doc.internal.pageSize.width - marginX, currentY);

    // Título do Documento
    currentY += 40;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text('RELATÓRIO FINANCEIRO GERAL', doc.internal.pageSize.width / 2, currentY, { align: 'center' });

    currentY += 30;

    // Preparar os dados da tabela
    const tableData = alunos.map((a) => [
        a.nome,
        a.turma || '-',
        formatKz(a.valorPropina),
        formatKz(a.valorPago),
        formatKz(a.valorDivida),
        a.statusFinanceiro
    ]);

    // Adicionar a tabela
    autoTable(doc, {
        startY: currentY,
        head: [['Nome Completo', 'Turma', 'Propinas (Kz)', 'Pago (Kz)', 'Dívida (Kz)', 'Situação']],
        body: tableData,
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 6,
            lineColor: [226, 232, 240], // border-slate-200
            lineWidth: 0.5,
            valign: 'middle'
        },
        headStyles: {
            fillColor: [30, 41, 59], // bg-slate-800
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 140 }, // Nome
            1: { cellWidth: 60, halign: 'center' }, // Turma
            2: { halign: 'right' }, // Propinas
            3: { halign: 'right', textColor: [16, 185, 129] }, // Pago (verde)
            4: { halign: 'right', fontStyle: 'bold' }, // Dívida
            5: { halign: 'center', fontStyle: 'bold' } // Status
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                if (data.cell.raw !== '0,00 Kz') {
                    data.cell.styles.textColor = [239, 68, 68]; // bg-red-500
                }
            }
            if (data.section === 'body' && data.column.index === 5) {
                const val = data.cell.raw;
                if (val === 'Regularizado') data.cell.styles.textColor = [16, 185, 129];
                if (val === 'Em Dívida') data.cell.styles.textColor = [239, 68, 68];
                if (val === 'Pendente') data.cell.styles.textColor = [245, 158, 11];
            }
        }
    });

    // Totais Finais
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 40;

    const totalFaturado = alunos.reduce((acc, a) => acc + a.valorPropina, 0);
    const totalPago = alunos.reduce((acc, a) => acc + a.valorPago, 0);
    const totalDivida = alunos.reduce((acc, a) => acc + a.valorDivida, 0);

    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(marginX, finalY - 20, doc.internal.pageSize.width - (marginX * 2), 70, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('RESUMO FINANCEIRO GLOBAL', marginX + 15, finalY);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Faturado: ${formatKz(totalFaturado)}`, marginX + 15, finalY + 20);
    doc.setTextColor(16, 185, 129); // Verde
    doc.text(`Total Recebido: ${formatKz(totalPago)}`, marginX + 200, finalY + 20);
    doc.setTextColor(239, 68, 68); // Vermelho
    doc.text(`Total em Dívida: ${formatKz(totalDivida)}`, marginX + 380, finalY + 20);

    // Assinaturas
    const assY = finalY + 120;
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.line(marginX + 40, assY, marginX + 180, assY);
    doc.line(doc.internal.pageSize.width - marginX - 180, assY, doc.internal.pageSize.width - marginX - 40, assY);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('A Direção Geral', marginX + 110, assY + 15, { align: 'center' });
    doc.text('O(A) Tesoureiro(a)', doc.internal.pageSize.width - marginX - 110, assY + 15, { align: 'center' });

    // Rodapé e Numeração de Páginas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Página ${i} de ${pageCount} - Gerado automaticamente via Supabase Cloud SaaS`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 20,
            { align: 'center' }
        );
    }

    // Baixar PDF
    doc.save(`Relatorio_Financeiro_Escolar_${new Date().getTime()}.pdf`);
};

export const exportNotasPDF = (params: {
    escola: string;
    turma: string;
    disciplina: string;
    periodo: string;
    anoLetivo: string;
    rows: any[];
    stats: { media: number; aprovacao: number };
}) => {
    const doc = new jsPDF('portrait', 'pt', 'A4');
    const marginX = 40;
    let currentY = 40;

    // Cabeçalho Institucional
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(params.escola.toUpperCase(), marginX, currentY);

    currentY += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`PAUTA DE AVALIAÇÃO - ${params.periodo.toUpperCase()}`, marginX, currentY);

    currentY += 15;
    doc.text(`Ano Letivo: ${params.anoLetivo} | Disciplina: ${params.disciplina} | Turma: ${params.turma}`, marginX, currentY);

    currentY += 20;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(marginX, currentY, doc.internal.pageSize.width - marginX, currentY);

    currentY += 30;

    // Dados da Pauta
    const tableData = params.rows.map((r, index) => [
        (index + 1).toString(),
        r.alunoNome,
        r.mac.toFixed(1),
        r.npp.toFixed(1),
        r.bonusAtitude > 0 ? `+${r.bonusAtitude.toFixed(1)}` : '0.0',
        r.valor.toFixed(1),
        r.valor >= 10 ? 'APROVADO' : 'DEFICIENTE'
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['Nº', 'Nome do Estudante', 'MAC', 'NPP', 'Bónus', 'Classif.', 'Resultado']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 5 },
        headStyles: { fillColor: [30, 41, 59], halign: 'center' },
        columnStyles: {
            0: { halign: 'center', cellWidth: 30 },
            1: { cellWidth: 180 },
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'center' },
            5: { halign: 'center', fontStyle: 'bold' },
            6: { halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                const val = parseFloat(data.cell.raw as string);
                if (val < 10) data.cell.styles.textColor = [239, 68, 68];
                else data.cell.styles.textColor = [16, 185, 129];
            }
            if (data.section === 'body' && data.column.index === 6) {
                const val = data.cell.raw as string;
                if (val === 'DEFICIENTE') data.cell.styles.textColor = [239, 68, 68];
                else data.cell.styles.textColor = [16, 185, 129];
            }
        }
    });

    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 40;

    // Estatísticas de Frequência/Aproveitamento
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, finalY - 20, 250, 60, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('ESTATÍSTICAS DA TURMA', marginX + 10, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Média da Turma: ${params.stats.media} valores`, marginX + 10, finalY + 15);
    doc.text(`Índice de Aproveitamento: ${params.stats.aprovacao}%`, marginX + 10, finalY + 30);

    // Assinaturas
    const assY = finalY + 100;
    doc.line(marginX + 40, assY, marginX + 180, assY);
    doc.line(doc.internal.pageSize.width - marginX - 180, assY, doc.internal.pageSize.width - marginX - 40, assY);

    doc.setFontSize(8);
    doc.text('O Professor da Disciplina', marginX + 110, assY + 15, { align: 'center' });
    doc.text('A Direção Pedagógica', doc.internal.pageSize.width - marginX - 110, assY + 15, { align: 'center' });

    doc.save(`Pauta_${params.turma}_${params.disciplina}_${params.periodo}.pdf`);
};

export const exportBoletimPDF = (params: {
    escola: string;
    alunoNome: string;
    alunoId: string;
    anoLetivo: string;
    stats: { media: number; frequencia: number; percent: number };
    disciplinas: any[];
}) => {
    const doc = new jsPDF('portrait', 'pt', 'A4');
    const marginX = 40;
    let currentY = 40;

    // Cabeçalho Premium
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, doc.internal.pageSize.width, 100, 'F');

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(params.escola.toUpperCase(), marginX, 60);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('BOLETIM INFORMATIVO DE DESEMPENHO ACADÉMICO', marginX, 80);

    currentY = 130;

    // Info do Aluno
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(params.alunoNome, marginX, currentY);

    currentY += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`ID: ${params.alunoId} | Ano Letivo: ${params.anoLetivo}`, marginX, currentY);

    currentY += 40;

    // Métricas Quick Look
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginX, currentY - 20, 515, 50, 5, 5, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('MÉDIA GERAL', marginX + 20, currentY + 10);
    doc.text('ASSIDUIDADE', marginX + 180, currentY + 10);
    doc.text('APROVEITAMENTO', marginX + 360, currentY + 10);

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(params.stats.media.toString(), marginX + 20, currentY + 25);
    doc.text(`${params.stats.frequencia}%`, marginX + 180, currentY + 25);
    doc.text(`${params.stats.percent}%`, marginX + 360, currentY + 25);

    currentY += 60;

    // Tabela de Notas
    const tableData = params.disciplinas.map(d => [
        d.nome,
        d.detalhesPorTrimestre[1]?.valor || '—',
        d.detalhesPorTrimestre[2]?.valor || '—',
        d.detalhesPorTrimestre[3]?.valor || '—',
        d.mediaFinal || '—',
        d.aprovado ? 'APROVADO' : 'RETIDO'
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['Disciplina', '1º Tri', '2º Tri', '3º Tri', 'Média', 'Situação']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], halign: 'center' },
        styles: { fontSize: 9, cellPadding: 8 },
        columnStyles: {
            0: { cellWidth: 200 },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'center', fontStyle: 'bold' },
            5: { halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                const val = data.cell.raw as string;
                if (val === 'RETIDO') data.cell.styles.textColor = [220, 38, 38];
                else data.cell.styles.textColor = [5, 150, 105];
            }
        }
    });

    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 60;

    // Rodapé de Autenticação
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, finalY, 180, finalY);
    doc.line(doc.internal.pageSize.width - 180, finalY, doc.internal.pageSize.width - marginX, finalY);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('O Encarregado de Educação', marginX + 30, finalY + 15);
    doc.text('O Secretário Académico', doc.internal.pageSize.width - 160, finalY + 15);

    doc.setFontSize(7);
    doc.text(`Gerado eletronicamente em ${new Date().toLocaleString('pt-AO')}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 30, { align: 'center' });

    doc.save(`Boletim_${params.alunoNome.replace(/\s+/g, '_')}_2026.pdf`);
};

export const exportPautaAnualPDF = (params: {
    escola: string;
    turma: string;
    anoLetivo: string;
    disciplinas: string[];
    rows: any[]; // [ { aluno, notas: { 'Matemática': { tri1, tri2, tri3, media }, ... } } ]
}) => {
    const doc = new jsPDF('landscape', 'pt', 'A4');
    const marginX = 30;
    let currentY = 40;

    // Cabeçalho de Pauta Anual
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(params.escola.toUpperCase(), marginX, currentY);

    currentY += 20;
    doc.setFontSize(10);
    doc.text(`PAUTA ANUAL CONSOLIDADA - TURMA: ${params.turma} | ANO LETIVO: ${params.anoLetivo}`, marginX, currentY);

    currentY += 30;

    // Preparar dados da tabela complexa (Matriz Horizontal)
    const headRow1 = ['Estudante'];
    const headRow2 = [''];

    params.disciplinas.forEach(d => {
        headRow1.push(d, '', '', ''); // Nome da disciplina ocupa 4 colunas (t1, t2, t3, mf)
        headRow2.push('T1', 'T2', 'T3', 'MF');
    });

    const tableRows = params.rows.map(row => {
        const rowData = [row.aluno];
        params.disciplinas.forEach(d => {
            const n = row.notas[d] || {};
            rowData.push(
                n.tri1 || '—',
                n.tri2 || '—',
                n.tri3 || '—',
                n.media || '—'
            );
        });
        return rowData;
    });

    autoTable(doc, {
        startY: currentY,
        head: [headRow1, headRow2],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2, halign: 'center' },
        headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontSize: 6 },
        columnStyles: { 0: { halign: 'left', cellWidth: 100, fontStyle: 'bold' } },
        didParseCell: (data) => {
            // Estilizar as médias finais de cada disciplina
            if (data.section === 'body' && data.column.index > 0 && data.column.index % 4 === 0) {
                data.cell.styles.fontStyle = 'bold';
                const val = parseFloat(data.cell.raw as string);
                if (!isNaN(val)) {
                    if (val < 10) data.cell.styles.textColor = [220, 38, 38];
                    else data.cell.styles.textColor = [5, 150, 105];
                }
            }
        }
    });

    doc.setFontSize(8);
    const finalY = (doc as any).lastAutoTable.finalY + 40;
    doc.text('O Conselho de Notas', marginX + 50, finalY);
    doc.text('A Direção Pedagógica', doc.internal.pageSize.width - 150, finalY);

    doc.save(`Pauta_Anual_${params.turma.replace(/\s+/g, '_')}_${params.anoLetivo.replace('/', '-')}.pdf`);
};

export const exportReciboPDF = (params: {
    escola: string;
    alunoNome: string;
    alunoId: string;
    parcela: {
        id: string;
        categoriaNome: string;
        vencimento: string;
        valorOriginal: number;
        descricao?: string | null;
    };
    pagamentos: {
        dataPagamento: string;
        valor: number;
        formaPagamento?: string | null;
    }[];
}) => {
    const doc = new jsPDF('portrait', 'pt', 'A5'); // Recibo em A5 é mais comum e prático
    const marginX = 30;
    let currentY = 40;

    const formatKz = (valor: number) => {
        return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(valor);
    };

    // Fundo decorativo leve
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, doc.internal.pageSize.width, 80, 'F');

    // Cabeçalho
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(params.escola.toUpperCase(), marginX, 45);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('RECIBO DE QUITAÇÃO INSTITUCIONAL', marginX, 60);

    // Número do Recibo e Data
    doc.setFontSize(7);
    doc.text(`Nº DOC: ${params.parcela.id.slice(0, 8).toUpperCase()}`, doc.internal.pageSize.width - marginX - 80, 45);
    doc.text(`EMITIDO EM: ${new Date().toLocaleDateString('pt-AO')}`, doc.internal.pageSize.width - marginX - 80, 55);

    currentY = 110;

    // Dados do Aluno
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTUDANTE:', marginX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(params.alunoNome, marginX + 70, currentY);

    currentY += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('CÓDIGO ID:', marginX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(params.alunoId, marginX + 70, currentY);

    currentY += 30;

    // Detalhes do Pagamento
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(marginX, currentY, doc.internal.pageSize.width - marginX, currentY);

    currentY += 20;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIÇÃO DO SERVIÇO / TAXA', marginX, currentY);
    doc.text('VALOR', doc.internal.pageSize.width - marginX - 50, currentY, { align: 'right' });

    currentY += 20;
    doc.setFont('helvetica', 'normal');
    doc.text(params.parcela.categoriaNome, marginX, currentY);
    doc.text(formatKz(params.parcela.valorOriginal), doc.internal.pageSize.width - marginX - 50, currentY, { align: 'right' });

    if (params.parcela.descricao) {
        currentY += 12;
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(`Obs: ${params.parcela.descricao}`, marginX, currentY);
    }

    currentY += 40;

    // Resumo de Liquidação
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginX, currentY - 15, doc.internal.pageSize.width - (marginX * 2), 60, 5, 5, 'F');

    const totalPago = params.pagamentos.reduce((acc, p) => acc + p.valor, 0);

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL LIQUIDADO:', marginX + 15, currentY + 10);
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text(formatKz(totalPago), marginX + 15, currentY + 30);

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    const p0 = params.pagamentos[0];
    if (p0) {
        doc.text(`PAGO VIA: ${p0.formaPagamento || 'Numerário / Não especificado'}`, marginX + 150, currentY + 10);
        doc.text(`DATA DA LIQUIDAÇÃO: ${p0.dataPagamento}`, marginX + 150, currentY + 25);
    }

    // Assinatura e Carimbo
    currentY += 100;
    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138);
    doc.text('VALIDADO POR SERVIÇOS FINANCEIROS', doc.internal.pageSize.width / 2, currentY, { align: 'center' });

    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(1);
    doc.line(doc.internal.pageSize.width / 2 - 60, currentY + 10, doc.internal.pageSize.width / 2 + 60, currentY + 10);

    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text('Este documento serve como comprovativo oficial de pagamento.', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 20, { align: 'center' });

    doc.save(`Recibo_${params.alunoNome.replace(/\s+/g, '_')}_${params.parcela.id.slice(0, 5)}.pdf`);
};

export const exportCartaoEstudantePDF = (params: {
    escola: string;
    alunoNome: string;
    alunoId: string;
    turmaNome?: string;
    fotoUrl?: string | null;
}) => {
    // Dimensões de um cartão CR80 (85.6mm x 53.98mm) aproximadas em pt (1mm = 2.83pt)
    // 242pt x 153pt
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [153, 242]
    });

    // Frente do Cartão
    // Fundo azul institucional
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 242, 40, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(params.escola.toUpperCase(), 10, 15);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('CARTÃO DE IDENTIFICAÇÃO DO ESTUDANTE', 10, 25);

    // Corpo do Cartão
    doc.setFillColor(255, 255, 255);
    doc.setTextColor(0, 0, 0);

    // Moldura da Foto (Placeholder)
    doc.setDrawColor(226, 232, 240);
    doc.rect(10, 50, 60, 75);
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text('FOTO DO', 25, 85);
    doc.text('ESTUDANTE', 20, 95);

    // Dados
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('NOME COMPLETO:', 80, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(params.alunoNome.toUpperCase(), 80, 72, { maxWidth: 150 });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('TURMA / CLASSE:', 80, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(params.turmaNome || 'NÃO ATRIBUÍDA', 80, 100);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('ID ESTUDANTE:', 80, 115);
    doc.setFont('helvetica', 'normal');
    doc.text(params.alunoId.slice(0, 12).toUpperCase(), 80, 125);

    // Rodapé do Cartão
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 140, 242, 13, 'F');
    doc.setFontSize(5);
    doc.setTextColor(255, 255, 255);
    doc.text('VÁLIDO PARA O ANO LETIVO 2026/2027', 121, 149, { align: 'center' });

    // Verso do Cartão (Nova Página)
    doc.addPage([153, 242], 'landscape');

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 242, 153, 'F');

    doc.setFontSize(6);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('INSTRUÇÕES E USO:', 10, 20);
    doc.setFont('helvetica', 'normal');
    const logs = [
        '- Este cartão é pessoal e intransmissível.',
        '- Deve ser exibido sempre que solicitado na escola.',
        '- Em caso de perda, contacte a secretaria.',
        '- Acesso exclusivo ao campus e biblioteca.'
    ];
    logs.forEach((line, i) => doc.text(line, 15, 30 + (i * 10)));

    // Assinatura
    doc.setDrawColor(30, 58, 138);
    doc.line(70, 110, 170, 110);
    doc.setFontSize(5);
    doc.text('ASSINATURA DA DIRECÇÃO', 121, 120, { align: 'center' });

    doc.text('SISTEMA AUTOMATIZADO NEXUS PREMIUM', 121, 145, { align: 'center' });

    doc.save(`Cartao_${params.alunoNome.replace(/\s+/g, '_')}.pdf`);
};
