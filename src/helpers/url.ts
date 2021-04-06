import { isDate, isPlainObject, isURLSearchParams } from './util'

function encode(val: string): string {
    return encodeURIComponent(val)
        .replace(/%40/g, '@')
        .replace(/%3A/gi, ':')
        .replace(/%24/g, '$')
        .replace(/%2C/gi, ',')
        .replace(/%20/g, '+')
        .replace(/%5B/gi, '[')
        .replace(/%5D/gi, ']')
}

export function isAbsoluteURL(url: string): boolean {
    return /(^[a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}

export function combineURL(baseURL: string, relativeURL?: string): string {
    return relativeURL
        ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}`
        : baseURL
}

/**
 * @description: 生成url
 * @param {string} url - 传入的url
 * @param {any} params - 传入的参数， 可以不传
 * @return {*}
 */
export function buildUrl(
    url: string,
    params?: any,
    paramsSerializer?: (params: any) => string
): string {
    if (!params) {
        return url
    }

    let serializedParams
    if (paramsSerializer) {
        serializedParams = paramsSerializer(params)
    } else if (isURLSearchParams(params)) {
        serializedParams = params.toString()
    } else {
        const parts: string[] = []

        Object.keys(params).forEach(key => {
            const val = params[key]
            if (val === null || typeof val === 'undefined') {
                return
            }

            // 统一转成数组处理
            let values = []
            if (Array.isArray(val)) {
                values = val
                key += '[]'
            } else {
                values = [val]
            }

            values.forEach(val => {
                if (isDate(val)) {
                    val = val.toISOString()
                } else if (isPlainObject(val)) {
                    val = JSON.stringify(val)
                }
                parts.push(`${encode(key)}=${encode(val)}`)
            })
        })
        serializedParams = parts.join('&')
    }

    if (serializedParams) {
        // 去掉哈希值
        const markIndex = url.indexOf('#')
        if (markIndex !== -1) {
            url = url.slice(0, markIndex)
        }
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
    }
    return url
}
