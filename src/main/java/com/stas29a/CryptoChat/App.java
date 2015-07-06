package com.stas29a.CryptoChat;

import com.stas29a.CryptoChat.components.engines.crypto.Crypto;
import org.java_websocket.server.WebSocketServer;

import java.net.InetSocketAddress;

/**
 * CryptoChat
 *
 */
public class App 
{
    public static void main( String[] args )
    {
        InetSocketAddress adr = new InetSocketAddress(7777);
        WebSocketServer webSocketServer = new com.stas29a.CryptoChat.components.WebSocketServer(adr, new Crypto());
        System.out.println("Starting chat server..");
        webSocketServer.start();
    }
}
