package com.stas29a.CryptoChat.components;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;

import java.net.InetSocketAddress;
import java.net.UnknownHostException;

/**
 * Created by stas29a on 05.07.15.
 */
public class WebSocketServer extends org.java_websocket.server.WebSocketServer
{
    protected IChat chatEngine;
    public WebSocketServer(InetSocketAddress address, IChat chatEngine) {
        super(address);
        this.chatEngine = chatEngine;
    }

    @Override
    public void onOpen(WebSocket webSocket, ClientHandshake clientHandshake) {
        System.out.println("Connection open");
        chatEngine.onOpen(webSocket, clientHandshake);
    }

    @Override
    public void onClose(WebSocket webSocket, int i, String s, boolean b) {
        chatEngine.onClose(webSocket, i, s, b);
    }

    @Override
    public void onMessage(WebSocket webSocket, String s) {
        chatEngine.onMessage(webSocket, s);
    }

    @Override
    public void onError(WebSocket webSocket, Exception e) {
        chatEngine.onError(webSocket, e);
    }
}
