import * as XLSX from 'xlsx-js-style';
import type { AlunoFinanceiro } from '@/data/escola/queries';

export const exportFinanceiroExcel = (alunos: AlunoFinanceiro[]) => {
    // 1. Criar dados para a planilha
    const data = alunos.map((a) => ({
        'Nome do Estudante': a.nome,
        Turma: a.turma || 'S/ Turma',
        'Total Faturado (Kz)': a.valorPropina,
        'Total Pago (Kz)': a.valorPago,
        'Total em Dívida (Kz)': a.valorDivida,
        'Status Financeiro': a.statusFinanceiro,
    }));

    // Totais Gerais
    const totalFaturado = alunos.reduce((acc, a) => acc + a.valorPropina, 0);
    const totalPago = alunos.reduce((acc, a) => acc + a.valorPago, 0);
    const totalDivida = alunos.reduce((acc, a) => acc + a.valorDivida, 0);

    // 2. Criar a folha (worksheet) e adicionar os dados
    const ws = XLSX.utils.json_to_sheet([]);

    // Adicionar Título Principal
    XLSX.utils.sheet_add_aoa(ws, [
        ['RELATÓRIO FINANCEIRO GERAL - ALUNOS'],
        ['Ano Letivo 2026/2027'],
        ['Data de Emissão:', new Date().toLocaleDateString('pt-AO')],
        [],
    ], { origin: 'A1' });

    // Adicionar Cabeçalhos da Tabela
    const headers = ['Nome do Estudante', 'Turma', 'Total Faturado (Kz)', 'Total Pago (Kz)', 'Total em Dívida (Kz)', 'Status Financeiro'];
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A5' });

    // Adicionar Dados
    XLSX.utils.sheet_add_json(ws, data, { origin: 'A6', skipHeader: true });

    // Adicionar Linha de Totais no Fim
    const lastRow = 6 + data.length;
    XLSX.utils.sheet_add_aoa(ws, [
        ['TOTAIS GERAIS', '', totalFaturado, totalPago, totalDivida, '']
    ], { origin: `A${lastRow + 1}` });

    // 3. Estilizar a Folha (Macros/Estilos)
    const titleStyle = { font: { bold: true, sz: 16, color: { rgb: '2563EB' } }, alignment: { horizontal: 'center' } };
    const headerStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1E293B' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    };
    const rowStyle = {
        alignment: { vertical: 'center' },
        border: { bottom: { style: 'thin', color: { rgb: 'E2E8F0' } } }
    };
    const moneyStyle = { ...rowStyle, numFmt: '#,##0.00' };
    const totalRowStyle = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'F1F5F9' } },
        alignment: { horizontal: 'right' }
    };

    // Aplicar estilos às células
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:F1');

    // Título (Merge A1:F1)
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } });
    ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 5 } });

    if (ws['A1']) ws['A1'].s = titleStyle;
    if (ws['A2']) ws['A2'].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } };

    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = { c: C, r: R };
            const cellRef = XLSX.utils.encode_cell(cellAddress);
            if (!ws[cellRef]) continue;

            if (R === 4) { // Cabeçalho (linha 5 excel, index 4)
                ws[cellRef].s = headerStyle;
            } else if (R >= 5 && R < lastRow) { // Dados
                if (C >= 2 && C <= 4) {
                    ws[cellRef].s = moneyStyle;
                } else {
                    ws[cellRef].s = rowStyle;
                }

                // Colorir o Status
                if (C === 5) {
                    const status = ws[cellRef].v;
                    let color = '64748B'; // gray
                    if (status === 'Regularizado') color = '10B981'; // green
                    if (status === 'Em Dívida') color = 'EF4444'; // red
                    if (status === 'Pendente') color = 'F59E0B'; // yellow
                    ws[cellRef].s = { font: { bold: true, color: { rgb: color } }, alignment: { horizontal: 'center' } };
                }
            } else if (R === lastRow) { // Linha de Totais
                ws[cellRef].s = { ...totalRowStyle, ...(C >= 2 && C <= 4 ? { numFmt: '#,##0.00' } : {}) };
            }
        }
    }

    // Ajustar largura das colunas
    ws['!cols'] = [
        { wch: 35 }, // Nome
        { wch: 20 }, // Turma
        { wch: 25 }, // Faturado
        { wch: 25 }, // Pago
        { wch: 25 }, // Dívida
        { wch: 20 }, // Status
    ];

    // 4. Criar o arquivo (workbook) e baixar
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Financeiro_Alunos_2026');
    XLSX.writeFile(wb, `Gestao_Financeira_Alunos_${new Date().getTime()}.xlsx`);
};
