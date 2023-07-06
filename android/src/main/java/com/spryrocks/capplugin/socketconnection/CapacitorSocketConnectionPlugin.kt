package com.spryrocks.capplugin.socketconnection

import com.getcapacitor.JSObject
import com.getcapacitor.NativePlugin
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.spryrocks.capplugin.socketconnection.socket.Socket
import com.spryrocks.capplugin.socketconnection.socket.SocketDelegate
import com.spryrocks.capplugin.socketconnection.socket.SocketOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.asCoroutineDispatcher
import kotlinx.coroutines.launch
import java.util.concurrent.Executor
import java.util.concurrent.Executors

@NativePlugin(name = "CapacitorSocketConnectionPlugin")
class CapacitorSocketConnectionPlugin : Plugin(), CoroutineScope, SocketDelegate {
    override val executor: Executor = Executors.newCachedThreadPool()
    override val coroutineContext = executor.asCoroutineDispatcher()

    private val socketsMap = mutableMapOf<String, Socket>()

    private val mappers = Mappers()

    @PluginMethod
    fun openConnection(call: PluginCall) {
        launch {
            try {
                val options = mappers.mapOpenConnectionOptionsFromCall(call)
                val link = NativeLink.generate()

                val socketOptions = SocketOptions(host = options.host, port = options.port)

                val socket = Socket(
                    uuid = link.uuid,
                    options = socketOptions,
                    delegate = this@CapacitorSocketConnectionPlugin
                )
                socketsMap[link.uuid] = socket

                socket.open()

                val result = OpenConnectionResult(link = link)
                success(call, mappers.mapOpenConnectionResultToJson(result))
            } catch (error: Throwable) {
                error(call, error)
            }
        }
    }

    @PluginMethod
    fun closeConnection(call: PluginCall) {
        launch {
            try {
                val options = mappers.mapCloseConnectionOptionsFromCall(call)
                val link = options.link

                val socket = findSocketByLink(link)

                removeSocket(socket)

                socket.close()

                success(call)
            } catch (error: Throwable) {
                error(call, error)
            }
        }
    }

    @PluginMethod
    fun sendData(call: PluginCall) {
        launch {
            try {
                val options = mappers.mapSendDataOptionsFromCall(call)
                val link = options.link
                val data = options.data

                val socket = findSocketByLink(link)

                socket.send(data)

                success(call)
            } catch (error: Throwable) {
                error(call, error)
            }
        }
    }

    override fun onData(socket: Socket, data: SocketData) {
        val event = OnDataEvent(socketUuid = socket.uuid, data = data)
        sendEvent(PluginEvents.OnData, mappers.mapOnDataEventToJson(event))
    }

    override fun onClose(socket: Socket) {
        removeSocket(socket)
        val event = OnCloseEvent(socketUuid = socket.uuid)
        sendEvent(PluginEvents.OnClose, mappers.mapOnCloseEventToJson(event))
    }

    override fun onError(socket: Socket, error: Throwable) {
        removeSocket(socket)
        val event = OnErrorEvent(socketUuid = socket.uuid, error = error)
        sendEvent(PluginEvents.OnError, mappers.mapOnErrorEventToJson(event))
    }

    private fun findSocketByLink(link: NativeLink): Socket {
        return socketsMap[link.uuid]
            ?: throw PluginException("Cannot find socket with provided uuid")
    }

    private fun removeSocket(socket: Socket) {
        socketsMap.remove(socket.uuid)
    }

    private fun success(call: PluginCall, data: JSObject? = null) {
        if (data != null) {
            call.resolve(data)
        } else {
            call.resolve()
        }
    }

    private fun error(call: PluginCall, error: Throwable) {
        val errorJson = mappers.mapErrorToJson(error)
        val code = errorJson.toString()
        call.reject(error.localizedMessage, code)
    }

    private fun sendEvent(event: PluginEvents, data: JSObject) {
        notifyListeners(event.value, data)
    }
}
