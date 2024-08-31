# @spryrocks/capacitor-socket-connection-plugin

Capacitor Socket Connection Plugin

## Install

```bash
npm install @spryrocks/capacitor-socket-connection-plugin@5.3.0
```

see [main](https://github.com/SpryRocks/capacitor-socket-connection-plugin/tree/main) branch for capacitor 6

see [main-capacitor2](https://github.com/SpryRocks/capacitor-socket-connection-plugin/tree/main-capacitor2) branch for capacitor 2

## Usage

### Create instance of socket connection class

```typescript
const socket = new Socket();
```

### Bind to events

#### onData

```typescript
socket.onData = function(data) {
  // handle received data
};
```

##### Callback function parameters


| Name | Type       |
| ---- | ---------- |
| data | Uint8Array |

#### onClose

```typescript
socket.onClose = function() {
    // handle socket close
};
```

#### onError

```typescript
socket.onError = function(error) {
    // handle socket error
};
```

##### Callback function parameters


| Name  | Type    |
| ----- | ------- |
| error | unknown |

#### onStateChanges

```typescript
socket.onStateChanged = function(state) {
    // handle socket state change
};
```

##### Callback function parameters


| Name  | Type        |
| ----- | ----------- |
| state | SocketState |

### Connect socket to endpoint

```typescript
await socket.open(host, port);
```

#### Parameters


| Name | Type   |
| ---- | ------ |
| host | String |
| port | Number |

### Write data to socket

```typescript
await socket.write(data);
```

#### Parameters


| Name | Type       |
| ---- | ---------- |
| data | Uint8Array |

### Close socket connection

```typescript
await socket.close();
```

### Get current state

```typescript
const state = socket.state;
```

## Q&A

Q: When I call the open method after being disconnected, I will be prompted that the open method can only be called once. How should I reconnect?

A: To re-connect the socket you should create the new socket and then open it.
