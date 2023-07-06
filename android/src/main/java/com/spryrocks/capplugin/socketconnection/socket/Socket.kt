package com.spryrocks.capplugin.socketconnection.socket

import com.spryrocks.capplugin.socketconnection.SocketData
import com.spryrocks.capplugin.socketconnection.SocketUuid
import java.net.InetSocketAddress
import java.net.Socket
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine
import java.net.Socket as JavaSocket

class Socket(
    val uuid: SocketUuid,
    private val options: SocketOptions,
    private val delegate: SocketDelegate
) {
    private val INPUT_STREAM_BUFFER_SIZE = 16 * 1024

    private val connection = createConnection(options)

    private val _stateLock = Object()
    private var state: SocketState = SocketState.Initial

    suspend fun open() {
        suspendCoroutine {
            executor.execute {
                try {
                    val host = options.host
                    val port = options.port
                    connection.connect(InetSocketAddress(host, port))
                    setupReceive()
                    it.resume(Unit)
                    synchronized(_stateLock) {
                        state = SocketState.Opened
                    }
                } catch (error: Throwable) {
                    it.resumeWithException(error)
                    synchronized(_stateLock) {
                        state = SocketState.Error
                    }
                    disposeInternal()
                }
            }
        }
    }

    suspend fun close() {
        suspendCoroutine {
            executor.execute {
                try {
                    connection.close()
                    it.resume(Unit)
                } catch (error: Throwable) {
                    it.resumeWithException(error)
                } finally {
                    synchronized(_stateLock) {
                        state = SocketState.Closed
                    }
                }
            }
        }
    }

    suspend fun send(data: SocketData) {
        suspendCoroutine {
            executor.execute {
                try {
                    connection.getOutputStream().write(data)
                    it.resume(Unit)
                } catch (error: Throwable) {
                    it.resumeWithException(error)
                }
            }
        }
    }

    private fun setupReceive() {
        executor.execute {
            try {
                val buffer = ByteArray(INPUT_STREAM_BUFFER_SIZE)
                var bytesRead: Int

                while (connection.getInputStream().read(buffer).also { bytesRead = it } >= 0) {
                    onData(buffer.copyOfRange(0, bytesRead))
                }
            } catch (error: Throwable) {
                onError(error)
            } finally {
                onClose()
            }
        }
    }

    private fun onData(data: SocketData) {
        delegate.onData(this, data)
    }

    private fun onClose() {
        synchronized(_stateLock) {
            if (state == SocketState.Closed) return
            if (state == SocketState.Error) return
        }
        delegate.onClose(this)
        synchronized(_stateLock) {
            state = SocketState.Closed
        }
        disposeInternal()
    }

    private fun onError(error: Throwable) {
        synchronized(_stateLock) {
            if (state == SocketState.Closed) return
            if (state == SocketState.Error) return
        }
        delegate.onError(this, error)
        synchronized(_stateLock) {
            state = SocketState.Error
        }
        disposeInternal()
    }

    private fun disposeInternal() {
        executor.execute {
            try {
                connection.close()
            } catch (ignored: Throwable) {
            }
        }
    }

    private val executor get() = delegate.executor

    companion object {
        private fun createConnection(options: SocketOptions): Socket {
            return JavaSocket().apply {
                soTimeout = 0
            }
        }
    }
}
