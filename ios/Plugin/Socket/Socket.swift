import Network

class Socket {
    private static let INPUT_STREAM_BUFFER_SIZE = 65536
    
    public let uuid: SocketUuid
    private let options: SocketOptions
    private var delegate: SocketDelegate
    private let connection: NWConnection
    private var openConnectionContinuation: CheckedContinuation<(), Error>? = nil
    private var disconnectCheckingContinuation: CheckedContinuation<(), Error>? = nil
    private var state: SocketState = SocketState.Initial
    
    init(uuid: SocketUuid, options: SocketOptions, delegate: SocketDelegate) {
        self.uuid = uuid
        self.options = options
        self.delegate = delegate
        self.connection = Socket.createConnection(options)
        connection.stateUpdateHandler = stateDidChange(to:)
    }
    
    func open() async throws {
        return try await withCheckedThrowingContinuation { continuation in
            openConnectionContinuation = continuation
            setupReceive()
            connection.start(queue: .main)
        }
    }
    
    func disconnect() async throws {
        return try await withCheckedThrowingContinuation {continuation in
            disconnectCheckingContinuation = continuation
            state = .Closed
            connection.cancel()
        }
    }
    
    func send(_ data: Array<UInt8>) async throws {
        return try await withCheckedThrowingContinuation {continuation in
            connection.send(content: Data(data), completion: NWConnection.SendCompletion.contentProcessed { error in
                if let error = error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            })
        }
    }
    
    private func setupReceive() {
        connection.receive(minimumIncompleteLength: 1, maximumLength: Socket.INPUT_STREAM_BUFFER_SIZE) { [self] (data, _, isComplete, error) in
            if let data = data, !data.isEmpty {
                onData(data)
            }
            if let error = error {
                onError(error)
            } else if isComplete {
                onClose()
            } else {
                self.setupReceive()
            }
        }
    }
    
    private func stateDidChange(to state: NWConnection.State) {
        switch state {
        case .preparing:
            break
        case .waiting(let error):
            onError(error)
            break
        case .ready:
            onReady()
            break
        case .cancelled:
            onCancelled()
            break
        default:
            break
        }
    }
    
    private func onData(_ data: Data) {
        let bytes = data.map { $0 }
        delegate.onData(socket: self, data: bytes)
    }
    
    private func onClose() {
        if (self.state == .Closed) {
            return
        }
        if (self.state == .Error) {
            return
        }
        delegate.onClose(socket: self)
        self.state = .Closed
        disposeInternal()
    }
    
    private func onReady() {
        if let continuation = openConnectionContinuation {
            openConnectionContinuation = nil
            continuation.resume()
            self.state = .Opened
        }
    }
    
    private func onCancelled() {
        if let continuation = disconnectCheckingContinuation {
            disconnectCheckingContinuation = nil
            continuation.resume()
            onClose()
        }
    }
    
    private func onError(_ error: Error) {
        if (self.state == .Closed) {
            return
        }
        if (self.state == .Error) {
            return
        }
        self.state = .Error
        if let continuation = openConnectionContinuation {
            openConnectionContinuation = nil
            continuation.resume(throwing: error)
        } else {
            delegate.onError(socket: self, error: error)
        }
        disposeInternal()
    }
    
    private func disposeInternal() {
        connection.cancel()
    }
    
    private static func createConnection(_ options: SocketOptions) -> NWConnection {
        let host = NWEndpoint.Host(options.host)
        let port = NWEndpoint.Port(rawValue: UInt16(options.port))!
        return NWConnection(host: host, port: port, using: .tcp)
    }
}
