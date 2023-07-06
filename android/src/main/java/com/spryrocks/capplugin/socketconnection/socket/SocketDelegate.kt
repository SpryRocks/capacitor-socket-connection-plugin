package com.spryrocks.capplugin.socketconnection.socket

import com.spryrocks.capplugin.socketconnection.SocketData
import java.util.concurrent.Executor

interface SocketDelegate {
    val executor: Executor

    fun onData(socket: Socket, data: SocketData)
    fun onClose(socket: Socket)
    fun onError(socket: Socket, error: Throwable)
}
