import Capacitor

public class Mappers {
    func mapOpenConnectionOptionsFromCall(_ call: CAPPluginCall) throws -> OpenConnectionOptions {
        let host = try getStringFromCall(call, "host")
        let port = try getIntFromCall(call, "port")
        return OpenConnectionOptions(host: host, port: port)
    }
    
    func mapConnectionResultToJson(_ result: OpenConnectionResult) -> JSObject {
        return ["link": mapNativeLinkToJson(result.link)]
    }

    func mapCloseConnectionOptionsFromCall(_ call: CAPPluginCall) throws -> CloseConnectionOptions {
        let link = try mapNativeLinkFromJson(try getObjectFromCall(call, "link"))
        return CloseConnectionOptions(link: link)
    }

    func mapSendDataOptionsFromCall(_ call: CAPPluginCall) throws -> SendDataOptions {
        let link = try mapNativeLinkFromJson(try getObjectFromCall(call, "link"))
        let data = try mapSocketDataFromJsArray(try getArrayFromCall(call, "data"))
        return SendDataOptions(link: link, data: data)
    }
    
    private func mapNativeLinkToJson(_ link: NativeLink) -> JSObject {
        return ["uuid": link.uuid]
    }

    private func mapNativeLinkFromJson(_ link: JSObject) throws -> NativeLink {
        return NativeLink(uuid: try getStringFromObject(link, "uuid"))
    }
    
    func mapOnDataEventToJson(_ event: OnDataEvent) -> JSObject {
        return [
            "data": event.data,
            "socketUuid": event.socketUuid,
        ]
    }
    
    func mapOnCloseEventToJson(_ event: OnCloseEvent) -> JSObject {
        return [
            "socketUuid": event.socketUuid,
        ]
    }
    
    func mapOnErrorEventToJson(_ event: OnErrorEvent) -> JSObject {
        return [
            "socketUuid": event.socketUuid,
            "error": mapErrorToJson(event.error),
        ]
    }
    
    func mapErrorToJson(_ error: Error) -> JSObject {
        return [
            "message": error.localizedDescription,
        ]
    }

    private func mapSocketDataFromJsArray(_ data: JSArray) throws -> SocketData {
        var arr: SocketData = []
        for item in data {
            guard let number = item as? NSNumber else {
                throw SocketError("Cannot decode data to NSNumber")
            }
            arr.append(UInt8(truncating: number))
        }
        return arr
    }

    private func getStringFromCall(_ call: CAPPluginCall, _ name: String) throws -> String {
        guard let result = call.getString(name) else {
            throw SocketError("Required \"\(name)\" string parameter is not exists")
        }
        return result
    }

    private func getIntFromCall(_ call: CAPPluginCall, _ name: String) throws -> Int {
        guard let result = call.getInt(name) else {
            throw SocketError("Required \"\(name)\" int parameter is not exists")
        }
        return result
    }

    private func getObjectFromCall(_ call: CAPPluginCall, _ name: String) throws -> JSObject {
        guard let result = call.getObject(name) else {
            throw SocketError("Required \"\(name)\" object parameter is not exists")
        }
        return result
    }

    private func getArrayFromCall(_ call: CAPPluginCall, _ name: String) throws -> JSArray {
        guard let result = call.getArray(name) else {
            throw SocketError("Required \"\(name)\" array parameter is not exists")
        }
        return result
    }

    private func getStringFromObject(_ obj: JSObject, _ name: String) throws -> String {
        guard let result = obj[name] as? String else {
            throw SocketError("Required \"\(name)\" string parameter is not exists")
        }
        return result
    }
}
