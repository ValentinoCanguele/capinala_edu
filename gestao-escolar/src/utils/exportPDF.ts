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
