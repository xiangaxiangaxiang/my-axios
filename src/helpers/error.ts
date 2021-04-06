import { AxiosRequestConfig, AxiosResponse } from '../types'

class AxiosError extends Error {
    isAxiosError: boolean

    constructor(
        public message: string,
        public config: AxiosRequestConfig,
        public code?: string | null,
        public request?: any,
        public response?: AxiosResponse
    ) {
        super(message)
        this.isAxiosError = true

        Object.setPrototypeOf(this, AxiosError.prototype)
    }
}

export function createError(
    message: string,
    config: AxiosRequestConfig,
    code?: string | null,
    request?: any,
    response?: AxiosResponse
) {
    return new AxiosError(message, config, code, request, response)
}
