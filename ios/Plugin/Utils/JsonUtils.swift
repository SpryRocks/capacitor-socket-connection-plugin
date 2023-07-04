func toJsonString(dict: Dictionary<String, Any>) -> String {
    let jsonData = try! JSONSerialization.data(withJSONObject: dict)
    return String(data: jsonData, encoding: .utf8)!
}
