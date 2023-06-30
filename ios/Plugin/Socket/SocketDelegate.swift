protocol SocketDelegate {
    func onData(socket: Socket, data: SocketData)
    func onClose(socket: Socket)
    func onError(socket: Socket, error: Error)
}
