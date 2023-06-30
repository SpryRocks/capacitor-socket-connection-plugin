import Foundation
import Capacitor

@objc(CapacitorSocketConnectionPluginPlugin)
public class CapacitorSocketConnectionPluginPlugin: CAPPlugin, SocketDelegate {
    private var socketsMap: [SocketUuid: Socket] = [:]
    
    private let mappers = Mappers()
    
    @objc
    func openConnection(_ call: CAPPluginCall) {
        Task {
            do {
                let options = mappers.mapOpenConnectionOptionsFromCall(call)
                let link = NativeLink.generate()
                
                let socketOptions = SocketOptions(host: options.host, port: options.port)
                
                let socket = Socket(uuid: link.uuid, options: socketOptions, delegate: self)
                socketsMap[link.uuid] = socket
                
                try await socket.connect()
                
                let result = OpenConnectionResult(link: link)
                self.success(call, mappers.mapConnectionResultToJson(result))
            } catch {
                self.error(call, error)
            }
        }
    }
    
    @objc
    func closeConnection(_ call: CAPPluginCall) {
        Task {
            do {
                let options = mappers.mapCloseConnectionOptionsFromCall(call)
                let link = options.link
                
                let socket = try findSocketByLink(link)
                
                removeSocket(socket)
                
                try await socket.disconnect()
                
                self.success(call)
            } catch {
                self.error(call, error)
            }
        }
    }
    
    @objc
    func sendData(_ call: CAPPluginCall) {
        Task {
            do {
                let options = mappers.mapSendDataOptionsFromCall(call)
                let link = options.link
                let data = options.data
                
                let socket = try findSocketByLink(link)
                
                try await socket.send(data)
                
                self.success(call)
            } catch {
                self.error(call, error)
            }
        }
    }
    
    func onData(socket: Socket, data: SocketData) {
        let event = OnDataEvent(socketUuid: socket.uuid, data: data)
        sendEvent(PluginEvents.OnData, data: mappers.mapOnDataEventToJson(event))
    }
    
    func onClose(socket: Socket) {
        removeSocket(socket)
        let event = OnCloseEvent(socketUuid: socket.uuid)
        sendEvent(PluginEvents.OnClose, data: mappers.mapOnCloseEventToJson(event))
    }
    
    func onError(socket: Socket, error: Error) {
        removeSocket(socket)
        let event = OnErrorEvent(socketUuid: socket.uuid, error: error)
        sendEvent(PluginEvents.OnError, data: mappers.mapOnErrorEvemtToJson(event))
    }
    
    private func removeSocket(_ socket: Socket) {
        socketsMap.removeValue(forKey: socket.uuid)
    }
    
    private func findSocketByLink(_ link: NativeLink) throws -> Socket {
        guard let found = socketsMap.first(where: { s in s.key == link.uuid }) else {
            throw PluginError("Cannot find socket with provided uuid")
        }
        return found.value
    }
    
    private func success(_ call: CAPPluginCall, _ data: PluginCallResultData = [:]) {
        call.resolve(data)
    }
    
    private func error(_ call: CAPPluginCall, _ error: Error) {
        call.reject(error.localizedDescription)
    }
    
    private func sendEvent(_ event: PluginEvents, data: JSObject) {
        notifyListeners(event.rawValue, data: data)
    }
}
