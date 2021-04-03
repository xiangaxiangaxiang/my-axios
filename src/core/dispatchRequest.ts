import { flattenHeaders } from '../helpers/headers'
import { buildUrl } from '../helpers/url'
import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '../types'
import transform from './transform'
import xhr from './xhr'

export default function axios(config: AxiosRequestConfig): AxiosPromise {
  throwIfCancellationRequested(config)
  processConfig(config)
  return xhr(config).then(res => transformResponseData(res))
}

function transformUrl(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildUrl(url!, params)
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
