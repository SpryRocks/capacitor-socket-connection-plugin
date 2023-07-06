#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(CapacitorSocketConnectionPluginPlugin, "CapacitorSocketConnectionPlugin",
           CAP_PLUGIN_METHOD(openConnection, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(closeConnection, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(sendData, CAPPluginReturnPromise);
)
