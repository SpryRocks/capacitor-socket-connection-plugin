import Foundation

@objc public class CapacitorSocketConnectionPlugin: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
