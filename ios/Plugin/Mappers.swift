import Capacitor

public class Mappers {
    func mapOpenConnectionOptionsFromCall(_ call: CAPPluginCall) -> OpenConnectionOptions {
        let host = call.getString("host")!
        let port = call.getInt("port")!
        return OpenConnectionOptions(host: host, port: port)
    }
    
    func mapConnectionResultToJson(_ result: OpenConnectionResult) -> JSObject {
        return ["link": mapNativeLinkToJson(result.link)]
    }
    
    func mapCloseConnectionOptionsFromCall(_ call: CAPPluginCall) -> CloseConnectionOptions {
        let link = mapNativeLinkFromJson(call.getObject("link")!)
        return CloseConnectionOptions(link: link)
    }
    
    func mapSendDataOptionsFromCall(_ call: CAPPluginCall) -> SendDataOptions {
        let link = mapNativeLinkFromJson(call.getObject("link")!)
        let data = mapSocketDataFromJsArray(call.getArray("data")!)
        return SendDataOptions(link: link, data: data)
    }
    
    private func mapNativeLinkToJson(_ link: NativeLink) -> JSObject {
        return ["uuid": link.uuid]
    }
    
    private func mapNativeLinkFromJson(_ link: JSObject) -> NativeLink {
        return NativeLink(uuid: link["uuid"] as! String)
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
    
    private func mapSocketDataFromJsArray(_ data: JSArray) -> SocketData {
        var arr: SocketData = []
        for item in data {
            let number = item as! NSNumber
            arr.append(UInt8(truncating: number))
        }
        return arr
    }
}
