'use strict'

const axios = require('axios')
const axiosRetry = require('axios-retry')
const ms = require('ms')

const version = require('../package.json').version

class HTTPFlusher {
  constructor (host, writeKey, timeout) {
    this.host = host
    this.writeKey = writeKey
    this.timeout = timeout

    axiosRetry(axios, {
      retries: 3,
      retryCondition: this._isErrorRetryable
    })
  }

  /**
   * Make a HTTP POST request to the specified host with the data from the events
   *
   * @param {Array} data
   * @param {Function} [callback]
   */
  call (data, callback) {
    // Don't set the user agent if we're not on a browser. The latest spec allows
    // the User-Agent header (see https://fetch.spec.whatwg.org/#terminology-headers
    // and https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader),
    // but browsers such as Chrome and Safari have not caught up.
    const headers = {
      'user-agent': `analytics-node ${version}`,
      'x-api-key': this.writeKey
    }

    if (typeof window === 'undefined') {
      headers['user-agent'] = `analytics-node/${version}`
    }

    const req = {
      method: 'POST',
      url: `${this.host}/v1/import`,
      auth: {
        username: this.writeKey
      },
      data,
      headers
    }

    if (this.timeout) {
      req.timeout = typeof this.timeout === 'string' ? ms(this.timeout) : this.timeout
    }
    axios(req)
      .then(() => callback())
      .catch(err => {
        if (err.response) {
          const error = new Error(err.response.statusText)
          return callback(error)
        }

        callback(err)
      })
  }

  _isErrorRetryable (error) {
    // Retry Network Errors.
    if (axiosRetry.isNetworkError(error)) {
      return true
    }

    if (!error.response) {
      // Cannot determine if the request can be retried
      return false
    }

    // Retry Server Errors (5xx).
    if (error.response.status >= 500 && error.response.status <= 599) {
      return true
    }

    // Retry if rate limited.
    if (error.response.status === 429) {
      return true
    }

    return false
  }
}

module.exports = HTTPFlusher
