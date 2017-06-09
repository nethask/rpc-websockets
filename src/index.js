"use strict"

import WebSocket from "./lib/websocket"
import clientFactory from "./lib/client"

export const Client = clientFactory(WebSocket)