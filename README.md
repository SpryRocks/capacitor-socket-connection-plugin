# @spryrocks/capacitor-socket-connection-plugin

Capacitor Socket Connection Plugin

## Install

```bash
npm install @spryrocks/capacitor-socket-connection-plugin@2.1.7
```

see [main-capacitor5](https://github.com/SpryRocks/capacitor-socket-connection-plugin/tree/main) branch for capacitor 5

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
|------|------------|
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
|-------|---------|
| error | unknown |

### Connect socket to endpoint

```typescript
await socket.open(host, port);
```

#### Parameters

| Name | Type   |
|------|--------|
| host | String |
| port | Number |

### Write data to socket

```typescript
await socket.write(data);
```

#### Parameters

| Name | Type       |
|------|------------|
| data | Uint8Array |

### Close socket connection

```typescript
await socket.close();
```
