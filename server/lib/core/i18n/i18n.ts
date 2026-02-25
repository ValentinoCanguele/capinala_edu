/**
 * I18nService — chave → texto para mensagens de erro e labels (backend).
 */
const messages: Record<string, string> = {
  'error.unauthorized': 'Não autorizado',
  'error.invalid_data': 'Dados inválidos',
  'error.not_found': 'Recurso não encontrado',
}

export function t(key: string, _locale?: string): string {
  return messages[key] ?? key
}
