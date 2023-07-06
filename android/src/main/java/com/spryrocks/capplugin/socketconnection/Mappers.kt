package com.spryrocks.capplugin.socketconnection

import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.PluginCall

class Mappers {
    fun mapOpenConnectionOptionsFromCall(call: PluginCall): OpenConnectionOptions {
        return OpenConnectionOptions(
            host = call.getString("host")!!,
            port = call.getInt("port")!!,
        )
    }

    fun mapOpenConnectionResultToJson(result: OpenConnectionResult): JSObject {
        return JSObject().apply {
            put("link", mapNativeLinkToJson(result.link))
        }
    }

    fun mapCloseConnectionOptionsFromCall(call: PluginCall): CloseConnectionOptions {
        return CloseConnectionOptions(
            link = mapNativeLinkFromJson(call.getObject("link")),
        )
    }

    fun mapSendDataOptionsFromCall(call: PluginCall): SendDataOptions {
        return SendDataOptions(
            link = mapNativeLinkFromJson(call.getObject("link")),
            data = mapSocketDataFromArray(call.getArray("data")),
        )
    }

    private fun mapNativeLinkToJson(link: NativeLink): JSObject {
        return JSObject().apply {
            put("uuid", link.uuid)
        }
    }

    private fun mapNativeLinkFromJson(link: JSObject): NativeLink {
        return NativeLink(
            uuid = link.getString("uuid")!!,
        )
    }

    private fun mapSocketDataFromArray(data: JSArray): SocketData {
        val socketData = SocketData(data.length())
        for (i in 0 until data.length()) {
            socketData[i] = data.getInt(i).toByte()
        }
        return socketData
    }

    fun mapOnDataEventToJson(event: OnDataEvent): JSObject {
        return JSObject().apply {
            put("data", mapSocketDataToJson(event.data))
            put("socketUuid", event.socketUuid)
        }
    }

    fun mapOnCloseEventToJson(event: OnCloseEvent): JSObject {
        return JSObject().apply {
            put("socketUuid", event.socketUuid)
        }
    }

    fun mapOnErrorEventToJson(event: OnErrorEvent): JSObject {
        return JSObject().apply {
            put("socketUuid", event.socketUuid)
            put("error", mapErrorToJson(event.error))
        }
    }

    fun mapErrorToJson(error: Throwable): JSObject {
        return JSObject().apply {
            put("message", error.localizedMessage ?: "Unknown error")
        }
    }

    private fun mapSocketDataToJson(data: SocketData): JSArray {
        val arr = JSArray()
        for (i in data.indices) {
            arr.put(data[i])
        }
        return arr
    }
}
