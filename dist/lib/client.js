/**
 * "Client" wraps the "uWebSockets/bindings" or a browser-implemented "WebSocket" library
 * according to the environment providing JSON RPC 2.0 support on top.
 * @module Client
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _assertArgs = require("assert-args");

var _assertArgs2 = _interopRequireDefault(_assertArgs);

var _eventemitter = require("eventemitter3");

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _circularJson = require("circular-json");

var _circularJson2 = _interopRequireDefault(_circularJson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (WebSocket) {
    return function (_EventEmitter) {
        _inherits(Client, _EventEmitter);

        /**
         * Instantiate a Client class.
         * @constructor
         * @param {String} address - url to a websocket server
         * @param {Object} options - ws options object with reconnect parameters
         * @return {Client}
         */
        function Client() {
            var address = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "ws://localhost:8080";

            var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                _ref$autoconnect = _ref.autoconnect,
                autoconnect = _ref$autoconnect === undefined ? true : _ref$autoconnect,
                _ref$reconnect = _ref.reconnect,
                reconnect = _ref$reconnect === undefined ? true : _ref$reconnect,
                _ref$reconnect_interv = _ref.reconnect_interval,
                reconnect_interval = _ref$reconnect_interv === undefined ? 1000 : _ref$reconnect_interv,
                _ref$max_reconnects = _ref.max_reconnects,
                max_reconnects = _ref$max_reconnects === undefined ? 5 : _ref$max_reconnects;

            _classCallCheck(this, Client);

            var _this = _possibleConstructorReturn(this, (Client.__proto__ || Object.getPrototypeOf(Client)).call(this));

            _this.queue = {};
            _this.rpc_id = 0;

            _this.autoconnect = autoconnect;
            _this.ready = false;
            _this.reconnect = reconnect;
            _this.reconnect_interval = reconnect_interval;
            _this.max_reconnects = max_reconnects;
            _this.current_reconnects = 0;

            if (_this.autoconnect) _this._connect(address, arguments[1]);
            return _this;
        }

        /**
         * Calls a registered RPC method on server.
         * @method
         * @param {String} method - RPC method name
         * @param {Object|Array} params - optional method parameters
         * @param {Number} timeout - RPC reply timeout value
         * @param {Object} uws_opts - options passed to uWebSockets
         * @return {Promise}
         */


        _createClass(Client, [{
            key: "call",
            value: function call(method, params, timeout, uws_opts) {
                var _this2 = this;

                (0, _assertArgs2.default)(arguments, {
                    "method": "string",
                    "[params]": ["object", Array],
                    "[timeout]": "number",
                    "[uws_opts]": "object"
                });

                if (!uws_opts && "object" === (typeof timeout === "undefined" ? "undefined" : _typeof(timeout))) {
                    uws_opts = timeout;
                    timeout = null;
                }

                return new Promise(function (resolve, reject) {
                    if (!_this2.ready) return reject(new Error("socket not ready"));

                    var rpc_id = ++_this2.rpc_id;

                    var message = {
                        jsonrpc: "2.0",
                        method: method,
                        params: params || null,
                        id: rpc_id
                    };

                    _this2.socket.send(JSON.stringify(message), uws_opts, function (error) {
                        if (error) return reject(error);

                        _this2.queue[rpc_id] = { promise: [resolve, reject] };

                        if (timeout) {
                            _this2.queue[rpc_id].timeout = setTimeout(function () {
                                _this2.queue[rpc_id] = null;
                                reject(new Error("reply timeout"));
                            }, timeout);
                        }
                    });
                });
            }

            /**
             * Sends a JSON-RPC 2.0 notification to server.
             * @method
             * @param {String} method - RPC method name
             * @param {Object} params - optional method parameters
             * @return {Promise}
             */

        }, {
            key: "notify",
            value: function notify(method, params) {
                var _this3 = this;

                (0, _assertArgs2.default)(arguments, {
                    "method": "string",
                    "[params]": ["object", Array]
                });

                return new Promise(function (resolve, reject) {
                    if (!_this3.ready) return reject(new Error("socket not ready"));

                    var message = {
                        jsonrpc: "2.0",
                        method: method,
                        params: params || null
                    };

                    _this3.socket.send(JSON.stringify(message), function (error) {
                        if (error) return reject(error);

                        resolve();
                    });
                });
            }

            /**
             * Subscribes for a defined event.
             * @method
             * @param {String} event - event name
             * @return {Undefined}
             * @throws {Error}
             */

        }, {
            key: "subscribe",
            value: function () {
                var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(event) {
                    var result,
                        _args = arguments;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    (0, _assertArgs2.default)(_args, {
                                        event: "string"
                                    });

                                    _context.next = 3;
                                    return this.call("rpc.on", [event]);

                                case 3:
                                    result = _context.sent;

                                    if (!(result[event] !== "ok")) {
                                        _context.next = 6;
                                        break;
                                    }

                                    throw new Error("Failed subscribing to an event with: " + result[event]);

                                case 6:
                                case "end":
                                    return _context.stop();
                            }
                        }
                    }, _callee, this);
                }));

                function subscribe(_x3) {
                    return _ref2.apply(this, arguments);
                }

                return subscribe;
            }()

            /**
             * Unsubscribes from a defined event.
             * @method
             * @param {String} event - event name
             * @return {Undefined}
             * @throws {Error}
             */

        }, {
            key: "unsubscribe",
            value: function () {
                var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(event) {
                    var result,
                        _args2 = arguments;
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                        while (1) {
                            switch (_context2.prev = _context2.next) {
                                case 0:
                                    (0, _assertArgs2.default)(_args2, {
                                        event: "string"
                                    });

                                    _context2.next = 3;
                                    return this.call("rpc.off", [event]);

                                case 3:
                                    result = _context2.sent;

                                    if (!(result[event] !== "ok")) {
                                        _context2.next = 6;
                                        break;
                                    }

                                    throw new Error("Failed unsubscribing from an event with: " + result);

                                case 6:
                                case "end":
                                    return _context2.stop();
                            }
                        }
                    }, _callee2, this);
                }));

                function unsubscribe(_x4) {
                    return _ref3.apply(this, arguments);
                }

                return unsubscribe;
            }()

            /**
             * Closes a WebSocket connection gracefully.
             * @method
             * @param {Number} code - socket close code
             * @param {String} data - optional data to be sent before closing
             * @return {Undefined}
             */

        }, {
            key: "close",
            value: function close(code, data) {
                this.socket.close(code || 1000, data);
            }

            /**
             * Connection/Message handler.
             * @method
             * @private
             * @param {String} address - WebSocket API address
             * @param {Object} options - ws options object
             * @return {Undefined}
             */

        }, {
            key: "_connect",
            value: function _connect(address, options) {
                var _this4 = this;

                this.socket = new WebSocket(address, options);

                this.socket.on("open", function () {
                    _this4.ready = true;
                    _this4.emit("open");
                    _this4.current_reconnects = 0;
                });

                this.socket.on("message", function (message) {
                    if (message instanceof ArrayBuffer) message = Buffer.from(message).toString();

                    try {
                        message = _circularJson2.default.parse(message);
                    } catch (error) {
                        return;
                    }

                    // check if any listeners are attached and forward event
                    if (message.notification && _this4.listeners(message.notification).length) {
                        if (!message.params.length) return _this4.emit(message.notification);

                        var args = [message.notification];

                        // using for-loop instead of unshift/spread because performance is better
                        for (var i = 0; i < message.params.length; i++) {
                            args.push(message.params[i]);
                        }return _this4.emit.apply(_this4, args);
                    }

                    if (!_this4.queue[message.id]) return;

                    if (_this4.queue[message.id].timeout) clearTimeout(_this4.queue[message.id].timeout);

                    if (message.error) _this4.queue[message.id].promise[1](message.error);else _this4.queue[message.id].promise[0](message.result);

                    _this4.queue[message.id] = null;
                });

                this.socket.on("error", function (error) {
                    return _this4.emit("error", error);
                });

                this.socket.on("close", function (code, message) {
                    if (_this4.ready) _this4.emit("close", code, message);

                    _this4.ready = false;

                    if (code === 1000) return;

                    _this4.current_reconnects++;

                    if (_this4.reconnect && _this4.max_reconnects > _this4.current_reconnects || _this4.max_reconnects === 0) setTimeout(function () {
                        return _this4._connect(address, options);
                    }, _this4.reconnect_interval);
                });
            }
        }]);

        return Client;
    }(_eventemitter2.default);
};