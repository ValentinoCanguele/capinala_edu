/**
 * Premium SaaS B2B Formatters
 */

/**
 * Formata um valor numérico para moeda Angolana (Kwanzas)
 */
export function formatKz(valor: number): string {
    return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 2,
    }).format(valor)
}

/**
 * Máscara para telefone Angolano (+244 9XX XXX XXX)
 */
export function formatPhone(phone: string): string {
    const cleaned = ('' + phone).replace(/\D/g, '')
    const match = cleaned.match(/^(?:244)?(9\d{2})(\d{3})(\d{3})$/)
    if (match) {
        return `+244 ${match[1]} ${match[2]} ${match[3]}`
    }
    return phone
}

/**
 * Tempo relativo (ex: "agora", "há 5 min", "há 2 h", "ontem", "12 Out 2026").
 * Catálogo Premium: formatação humanizada em listas.
 */
export function formatRelativeTime(dateString: string | Date): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInSecs = Math.floor(diffInMs / 1000)
    const diffInMins = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMins / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInSecs < 10) return 'agora'
    if (diffInSecs < 60) return `há ${diffInSecs} s`
    if (diffInMins < 60) return `há ${diffInMins} min`
    if (diffInHours < 24) return `há ${diffInHours} h`
    if (diffInDays === 1) return 'ontem'
    if (diffInDays < 7) return `há ${diffInDays} dias`
    if (diffInDays < 30) return `há ${Math.floor(diffInDays / 7)} sem`

    return new Intl.DateTimeFormat('pt-PT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date)
}

/**
 * Data curta para listas (ex: "12 Out" ou "12 Out 2026").
 */
export function formatDateShort(dateString: string | Date, withYear = false): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-PT', {
        day: 'numeric',
        month: 'short',
        ...(withYear ? { year: 'numeric' } : {}),
    }).format(date)
}

/**
 * Formato de NIF de Angola (Simulação simples de NIF de 10-14 dígitos)
 */
export function formatNIF(nif: string): string {
    return nif.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/**
 * Elipse para textos longos (truncar)
 */
export function truncateText(text: string, length: number = 30): string {
    if (!text) return ''
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
}

/**
 * Converte tamanho de bytes para KB/MB (ex: 2.5 MB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
