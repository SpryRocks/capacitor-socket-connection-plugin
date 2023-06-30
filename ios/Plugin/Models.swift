struct OpenConnectionOptions {
    let host: String
    let port: Int
}

struct OpenConnectionResult {
    let link: NativeLink
}

struct CloseConnectionOptions {
    let link: NativeLink
}

typealias SocketData = Array<UInt8>

struct SendDataOptions {
    let link: NativeLink
    let data: SocketData
}

enum PluginEvents: String {
    case OnData = "OnData"
    case OnClose = "OnClose"
    case OnError = "OnError"
}

struct OnDataEvent {
    let socketUuid: SocketUuid
    let data: SocketData
}

struct OnCloseEcent {
    let socketUuid: SocketUuid
}

struct OnErrorEvent {
    let socketUuid: SocketUuid
    let error: Error
}

typealias SocketUuid = String

struct NativeLink {
    let uuid: SocketUuid
    
    static func generate() -> NativeLink {
        return NativeLink(
            uuid: UUID().uuidString
        )
    }
}
