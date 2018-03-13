# analytics-node [![CircleCI](https://circleci.com/gh/segmentio/analytics-node.svg?style=svg&circle-token=68654e8cd0fcd16b1f3ae9943a1d8e20e36ae6c5)](https://circleci.com/gh/segmentio/analytics-node)

A Node.js client for [Segment](https://segment.com) — The hassle-free way to integrate analytics into any application.


## Installation

```bash
$ npm install analytics-node
```


## Usage

```js
const Analytics = require('analytics-node');

const client = new Analytics('write key');

client.track({
  event: 'event name',
  userId: 'user id'
});
```

### Sending events via Kinesis (KPL)

For sending events via kinesis you need to set the `flushMethod` option as `kinesis` and the `host` option with the name of your stream.

And if you need to authenticate on code level, you can send an object with your aws credentials on the first parameter (you can send an empty object if don't need it).

Example:

```js
const Analytics = require('analytics-node');

const awsCredentials = {
  accessKeyId: 'xxx',
  secretAccessKey: 'xxxx'
};

const client = new Analytics(awsCredentials, {
  host: 'MyStramName',
  flushMethod: 'kinesis'
});

```

## Documentation

Documentation is available at [https://segment.com/libraries/node](https://segment.com/libraries/node).


## License

Copyright &copy; 2017 Segment Inc. \<friends@segment.com\>
