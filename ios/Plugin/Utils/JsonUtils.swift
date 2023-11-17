func toJsonString(dict: Dictionary<String, Any>) throws -> String {
    let jsonData = try JSONSerialization.data(withJSONObject: dict)
    guard let json = String(data: jsonData, encoding: .utf8) else {
        throw SocketError("Cannot create json string from data")
    }
    return json
}
