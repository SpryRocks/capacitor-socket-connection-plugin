package com.spryrocks.capplugin.socketconnection;

import android.util.Log;

public class CapacitorSocketConnectionPlugin {

    public String echo(String value) {
        Log.i("Echo", value);
        return value;
    }
}
