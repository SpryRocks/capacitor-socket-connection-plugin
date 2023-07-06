package com.spryrocks.capplugin.socketconnection

import java.util.UUID

typealias SocketData = ByteArray
typealias SocketUuid = String

data class OpenConnectionOptions(val host: String, val port: Int)

data class OpenConnectionResult(val link: NativeLink)

data class CloseConnectionOptions(val link: NativeLink)

data class SendDataOptions(val link: NativeLink, val data: SocketData)

data class OnDataEvent(val socketUuid: SocketUuid, val data : SocketData)

data class OnCloseEvent(val socketUuid: SocketUuid)

data class OnErrorEvent(val socketUuid: SocketUuid, val error: Throwable)

enum class PluginEvents(val value: String) {
    OnData("OnData"),
    OnClose("OnClose"),
    OnError("OnError"),
}

data class NativeLink(val uuid: SocketUuid) {
    companion object {
        fun generate(): NativeLink {
            return NativeLink(
                UUID.randomUUID().toString()
            )
        }
    }
}
