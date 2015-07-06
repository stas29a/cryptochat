package com.stas29a.CryptoChat.components;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;

/**
 * Created by stas29a on 05.07.15.
 */
public interface IChat {
    public void onOpen(WebSocket webSocket, ClientHandshake clientHandshake);
    public void onClose(WebSocket webSocket, int i, String s, boolean b);
    public void onMessage(WebSocket webSocket, String s);
    public void onError(WebSocket webSocket, Exception e);
}
