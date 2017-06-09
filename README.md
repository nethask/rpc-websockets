# JSON-RPC 2.0 implementation over WebSockets

## Installation

```
npm install rpc-websockets
```

## Examples

```js
var WebSocket = require('rpc-websockets').Client
var WebSocketServer = require('rpc-websockets').Server

// instantiate Server and start listening for requests
var server = new WebSocketServer({
  port: 8080,
  host: 'localhost'
})

// register an RPC method
server.register('sum', function(params) {
  return params[0] + params[1]
})

// create an event
server.event('feedUpdated')

// get events (getter method)
console.log(server.eventList)

// emit an event to subscribers
server.emit('feedUpdated')

// close the server
server.close()

// instantiate Client and connect to an RPC server
var ws = new WebSocket('ws://localhost:8080')

ws.on('open', function() {
  // call an RPC method with parameters
  ws.call('sum', [5, 3]).then(function(result) {
    require('assert').equal(result, 8)
  })

  // send a notification to an RPC server
  ws.notify('openedNewsModule')

  // subscribe to receive an event
  ws.subscribe('feedUpdated')

  ws.on('feedUpdated', function() {
    updateLogic()
  })

  // unsubscribe from an event
  ws.unsubscribe('feedUpdated')

  // close a websocket connection
  ws.close()
})
```

## Client

```js
var WebSocket = require('rpc-websockets').Client
var ws = new WebSocket('ws://localhost:8080')
```

### new WebSocket(address[, options]) -> Client

Instantiate a WebSocket client.

Parameters:
* `address` {String}: The URL of the WebSocket server. The URL path portion resolves to a server namespace. Defaults to 'ws://localhost:8080'.
* `options` {Object}: Client options that are also forwarded to `μws`.
  * `autoconnect` {Boolean}: Client autoconnect upon Client class instantiation. Defaults to `true`.
  * `reconnect` {Boolean}: Whether client should reconnect automatically once the connection is down. Defaults to `true`.
  * `reconnect_interval` {Number}: Time between adjacent reconnects. Defaults to `1000`.
  * `max_reconnects` {Number}: Maximum number of times the client should try to reconnect. Defaults to `5`.

### ws.call(method[, params[, timeout[, μws_options]]]) -> Promise

Calls a registered RPC method on server. Resolves once the response is ready. Throws if an RPC error was received.

Parameters:
* `method` {String}: An RPC method name to run on server-side.
* `params` {Object|Array}: Optional parameter(s) to be sent along the request.
* `timeout` {Number}: Optional RPC reply timeout in milliseconds.
* `μws_options` {Object}: Optional parameters passed to μws. Not available on web browsers.
  * `compress` {Boolean}: Specifies whether data should be compressed or not. Defaults to true when permessage-deflate is enabled.
  * `binary` {Boolean}: Specifies whether data should be sent as a binary or not. Default is autodetected.
  * `mask` {Boolean} Specifies whether data should be masked or not. Defaults to true when websocket is not a server client.
  * `fin` {Boolean} Specifies whether data is the last fragment of a message or not. Defaults to true.

### ws.notify(method[, params])

Sends a JSON-RPC 2.0 notification to server.

Parameters:
* `method` {String}: An RPC method name to run on server-side.
* `params` {Object|Array}: Optional parameter(s) to be sent along the request.

### ws.subscribe(event) -> Promise

Subscribes for a defined event.

Parameters:
* `event` {String}: Event name.

### ws.unsubscribe(event) -> Promise

Unsubscribes from a defined event.

Parameters:
* `event` {String}: Event name.

### ws.close([code[, data]])

Closes a WebSocket connection gracefully.

Parameters:
* `code` {Number}: Socket close code.
* `data` {String}: Optional data to be sent to socket before closing.

### Event: 'open'

Emits when the connection is opened and ready for use.

### Event: 'error'

* &lt;Error&gt;

Emits when a socket error is raised.

### Event: 'close'

Emits when the connection is closed.

### Event: &lt;Notification&gt;

* &lt;Object&gt;

Emits a notification event with possible parameters a client has subscribed to once the server sends it.

Example:
```js
ws.subscribe('feedUpdated')

ws.on('feedUpdated', handlerFunction)
```

## License

  [MIT](LICENSE)
