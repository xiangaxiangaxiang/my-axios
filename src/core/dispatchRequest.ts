import { flattenHeaders } from '../helpers/headers'
import { buildUrl, combineURL, isAbsoluteURL } from '../helpers/url'
import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '../types'
import transform from './transform'
import xhr from './xhr'

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
    throwIfCancellationRequested(config)
    processConfig(config)
    return xhr(config).then(
        res => transformResponseData(res),
        e => {
            if (e && e.response) {
                e.response = transformResponseData(e.response)
            }
            return Promise.reject(e)
        }
    )
}

export function transformUrl(config: AxiosRequestConfig): string {
    let { url, params, paramsSerializer, baseURL } = config
    if (baseURL && !isAbsoluteURL(url!)) {
        url = combineURL(baseURL, url)
    }
    return buildUrl(url!, params, paramsSerializer)
}

function processConfig(config: AxiosRequestConfig): void {
    config.url = transformUrl(config)
    config.data = transform(config.data, config.headers, config.transformRequest)
    config.headers = flattenHeaders(config.headers, config.method!)
}

function transformResponseData(res: AxiosResponse): AxiosResponse {
    res.data = transform(res.data, res.headers, res.config.transformResponse)
    return res
}

function throwIfCancellationRequested(config: AxiosRequestConfig) {
    if (config.cancelToken) {
        config.cancelToken.throwIfRequested()
    }
}
