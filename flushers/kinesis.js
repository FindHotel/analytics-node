'use strict'

const { Kinesis } = require('aws-sdk')
const aggregate = require('aws-kinesis-agg').aggregate;
const noop = () => {}

class KinesisFlusher {
  constructor (host, awsCredentials) {
    this.host = host
    this.kinesis = new Kinesis(awsCredentials)
  }

  /**
   * Send message to Kinesis using "putRecord", this is the function called
   * as callback by the kinesis aggregator function
   *
   * @param {Function} [callback]
   * @param {Object} err
   * @param {Object} [encodedMessage] { Data, PartitionKey }
   */
  sendMessageToKinesis (encodedMessage, callback) {
    const params = {
      Data: encodedMessage.data,
      PartitionKey: encodedMessage.partitionKey,
      StreamName: this.host
    }

    this.kinesis.putRecord(params, function (err, data) {
      if (err) callback(err)
      else callback()
    })
  }

  /**
   * Generate aggregated message (KPL) and send to Kinesis
   * as callback by the kinesis aggregator function
   *
   * @param {Array} data
   * @param {Function} [callback]
   */
  call (data, callback) {
    const kinesisMessages = data.batch.map((record) => {
      var pk = (1.0 * Math.random()).toString().replace('.', '')

      return {
        partitionKey: pk,
        data: JSON.stringify(record)
      }
    })

    // The callback is envoked when the number of records supplied
    // exceeds the Kinesis maximum record size
    aggregate(
      kinesisMessages,
      this.sendMessageToKinesis.bind(this),
      noop,
      callback
    )
  }
}

module.exports = KinesisFlusher
