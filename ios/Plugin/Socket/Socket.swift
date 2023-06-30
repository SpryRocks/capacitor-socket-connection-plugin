import Network

class Socket {
    public let uuid: SocketUuid
    private let options: SocketOptions
    private var delegate: SocketDelegate
    private let connection: NWConnection
    private var connectCheckingContinuation: CheckedContinuation<(), Error>? = nil
    private var disconnectCheckingContinuation: CheckedContinuation<(), Error>? = nil
    
    init(uuid: SocketUuid, options: SocketOptions, delegate: SocketDelegate) {
        self.uuid = uuid
        self.options = options
        self.delegate = delegate
        self.connection = Socket.createConnection(options)
        connection.stateUpdateHandler = stateDidChange(to:)
    }
    
    func connect() async throws {
        return try await withCheckedThrowingContinuation { continuation in
            connectCheckingContinuation = continuation
            setupReceive()
            connection.start(queue: .main)
        }
    }
    
    func disconnect() async throws {
        return try await withCheckedThrowingContinuation {continuation in
            disconnectCheckingContinuation = continuation
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
        connection.receive(minimumIncompleteLength: 1, maximumLength: 65536) { [self] (data, _, isComplete, error) in
            if let data = data, !data.isEmpty {
                onDataReceived(data)
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
    
    private func onDataReceived(_ data: Data) {
        let bytes = data.map { $0 }
        delegate.onData(socket: self, data: bytes)
    }
    
    private func onClose() {
        delegate.onClose(socket: self)
    }
    
    private func onError(_ error: Error) {
        delegate.onError(socket: self, error: error)
    }
    
    private func stateDidChange(to state: NWConnection.State) {
        switch state {
        case .ready:
            if let continuation = connectCheckingContinuation {
                connectCheckingContinuation = nil
                continuation.resume()
            }
            break
        case .cancelled:
            if let continuation = disconnectCheckingContinuation {
                disconnectCheckingContinuation = nil
                continuation.resume()
            }
            break;
        default:
            break
        }
    }
    
    private static func createConnection(_ options: SocketOptions) -> NWConnection {
        let host = NWEndpoint.Host(options.host)
        let port = NWEndpoint.Port(rawValue: UInt16(options.port))!
        let connection = NWConnection(host: host, port: port, using: .tcp)
        return connection
    }
}
