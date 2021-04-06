import cookie from '../helpers/cookie'
import { createError } from '../helpers/error'
import { parseHeaders } from '../helpers/headers'
import { isFormData, isURLSameOrigin } from '../helpers/util'
import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '../types'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
        const {
            data = null,
            url,
            method = 'get',
            headers,
            responseType,
            timeout,
            cancelToken,
            withCredentials,
            xsrfHeaderName,
            xsrfCookieName,
            onDownloadProgress,
            onUploadloadProgress,
            auth,
            validateStatus
        } = config

        const request = new XMLHttpRequest()

        request.open(method.toUpperCase(), url!, true)

        configureRequest()

        addEvents()

        processHeaders()

        processCancel()

        request.send(data)

        function configureRequest() {
            /* 设置响应类型 */
            if (responseType) {
                request.responseType = responseType
            }

            if (withCredentials) {
                request.withCredentials = withCredentials
            }

            /* 超时 */
            if (timeout) {
                request.timeout = timeout
            }
        }

        function addEvents() {
            /* 获取返回值 */
            request.onreadystatechange = function handleLoad() {
                if (request.readyState !== 4) {
                    return
                }
                if (request.status === 0) {
                    return
                }
                const responseHeaders = request.getAllResponseHeaders()
                const responseData =
                    responseType !== 'text' ? request.response : request.responseText
                const response: AxiosResponse = {
                    data: responseData,
                    status: request.status,
                    statusText: request.statusText,
                    headers: parseHeaders(responseHeaders),
                    config,
                    request
                }
                handleResponse(response)
            }

            request.ontimeout = function handleTimeout() {
                reject(
                    createError(
                        `Timeout of ${timeout} ms exceeded`,
                        config,
                        'ECONNABORTED',
                        request
                    )
                )
            }

            /* 异常处理 */
            request.onerror = function handleError() {
                reject(createError('Netword Error', config, null, request))
            }

            /* 上传下载进度 */
            if (onDownloadProgress) {
                request.onprogress = onDownloadProgress
            }

            if (onUploadloadProgress) {
                request.upload.onprogress = onUploadloadProgress
            }
        }

        function processHeaders() {
            if (isFormData(data)) {
                delete headers['Content-Type']
            }

            /* xsrf处理 */
            if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
                const xsrfValue = cookie.read(xsrfCookieName)
                if (xsrfValue && xsrfHeaderName) {
                    headers[xsrfHeaderName!] = xsrfValue
                }
            }

            if (auth) {
                headers['Authorization'] = `Basic ${btoa(auth.username + ':' + auth.password)}`
            }

            /* 添加请求头 */
            Object.keys(headers).forEach(name => {
                if (data === null && name.toLowerCase() === 'content-type') {
                    delete headers[name]
                } else {
                    request.setRequestHeader(name, headers[name])
                }
            })
        }

        function processCancel() {
            if (cancelToken) {
                cancelToken.promise.then(resason => {
                    request.abort()
                    reject(resason)
                })
            }
        }

        /* 区分情况是否进行异常处理， 如果正常返回则不需要 */
        function handleResponse(response: AxiosResponse) {
            if (!validateStatus || validateStatus(response.status)) {
                resolve(response)
            } else {
                reject(
                    createError(
                        `Request failed with status code ${response.status}`,
                        config,
                        null,
                        request,
                        response
                    )
                )
            }
        }
    })
}
