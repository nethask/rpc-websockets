/**
 * WebSocket implements a browser-side WebSocket specification.
 * @module Client
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require("eventemitter3");

var _eventemitter2 = _interopRequireDefault(_eventemitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebSocket = function (_EventEmitter) {
    _inherits(WebSocket, _EventEmitter);

    /** Instantiate a WebSocket class
     * @constructor
     * @param {String} address - url to a websocket server
     * @param {(String|Array)} protocols - a list of protocols
     * @return {WebSocket} - returns a WebSocket instance
     */
    function WebSocket(address, protocols) {
        _classCallCheck(this, WebSocket);

        var _this = _possibleConstructorReturn(this, (WebSocket.__proto__ || Object.getPrototypeOf(WebSocket)).call(this));

        _this.socket = new window.WebSocket(address, protocols);

        _this.socket.onopen = function () {
            return _this.emit("open");
        };
        _this.socket.onmessage = function (event) {
            return _this.emit("message", event.data);
        };
        _this.socket.onerror = function (error) {
            return _this.emit("error", error);
        };
        _this.socket.onclose = function () {
            return _this.emit("close");
        };
        return _this;
    }

    /**
     * Sends data through a websocket connection
     * @method
     * @param {(String|Object)} data - data to be sent via websocket
     * @param {Object} options - ws options
     * @param {Function} callback - a callback called once the data is sent
     * @return {Undefined}
     */


    _createClass(WebSocket, [{
        key: "send",
        value: function send(data, options, callback) {
            try {
                this.socket.send(data);
                callback();
            } catch (error) {
                callback(error);
            }
        }

        /**
         * Closes an underlying socket
         * @method
         * @param {Number} code - status code explaining why the connection is being closed
         * @param {String} reason - a description why the connection is closing
         * @return {Undefined}
         * @throws {Error}
         */

    }, {
        key: "close",
        value: function close(code, reason) {
            this.socket.close(code, reason);
        }
    }]);

    return WebSocket;
}(_eventemitter2.default);

exports.default = WebSocket;