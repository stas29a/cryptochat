package com.stas29a.CryptoChat.components.engines.crypto;

import com.stas29a.CryptoChat.components.IChat;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.json.JSONObject;
import org.json.JSONTokener;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by stas29a on 05.07.15.
 */
public class Crypto implements IChat {
    protected Map<String,ArrayList<WebSocket>> chats = new HashMap<String, ArrayList<WebSocket>>();
    protected Map<WebSocket, String> connectionToChat = new HashMap<WebSocket, String>();

    @Override
    public void onOpen(WebSocket webSocket, ClientHandshake clientHandshake) {
        System.out.println("New connection \n");
    }

    @Override
    public void onClose(WebSocket webSocket, int i, String s, boolean b) {
        System.out.println("Connection is closed");
        String chatId = connectionToChat.get(webSocket);

        if(chatId != null) {
            ArrayList<WebSocket> arConnections = chats.get(chatId);

            if(arConnections != null) {
                arConnections.remove(webSocket);
            }
        }
        connectionToChat.remove(webSocket);
    }

    @Override
    public void onMessage(WebSocket webSocket, String s) {
        System.out.println("Got a new message " + s);
        try {
            JSONObject obj = new JSONObject(s);

            if (obj == null) {
                System.out.println("Bad json given");
                System.out.println(s);
                return;
            }

            if (!obj.isNull("command")) {
                System.out.println("Got a new command: " + obj.getString("command"));
                runCommand(obj.getString("command"), obj, webSocket);
                return;
            }

            if (!obj.isNull("message")) {
                System.out.println("Got a new message: " + obj.getString("message"));
                String chatId = connectionToChat.get(webSocket);
                sendMessage(chatId, obj.getString("message"), webSocket);
                return;
            }
        }
        catch (Throwable e)
        {
            System.out.println("Somethig going wrong, " + e);
        }
    }

    @Override
    public void onError(WebSocket webSocket, Exception e) {
        System.out.println("Exception " + e.getStackTrace());
    }

    protected void sendSysMessage(String chatId, String msg, WebSocket excludeUser)
    {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("server_command", "-system_message " + msg);
        sendToAll(chatId, jsonObject.toString(), null);
    }

    protected void sendMessage(String chatId, String msg, WebSocket excludeUser)
    {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("message", msg);
        msg = jsonObject.toString();
        sendToAll(chatId, msg, excludeUser);
    }

    protected void sendToAll(String chatId, String msg, WebSocket excludeUser)
    {
        System.out.println("Send to all connections in chat " + chatId);
        ArrayList<WebSocket> chatConnections = this.chats.get(chatId);

        if(chatConnections == null)
            return;

        for (WebSocket connection : chatConnections) {
            if(connection == excludeUser)
                continue;

            System.out.println("Sending message '"+ msg +"' to connection " + connection);
            connection.send(msg);
        }
    }

    protected void runCommand(String command, JSONObject query, WebSocket webSocket)
    {
        if(command.equals("join"))
        {
            commandJoin(query, webSocket);
            return;
        }
    }

    protected void commandJoin(JSONObject query, WebSocket webSocket)
    {
        String chatId = query.getString("chat_id");
        ArrayList<WebSocket> connections = this.chats.get(chatId);

        if(connections == null) {
            connections = new ArrayList<WebSocket>();
        }

        if(!connections.contains(webSocket)) {
            System.out.println("Join new user");
            sendSysMessage(chatId, "New user has been connected", null);
            connections.add(webSocket);
            this.chats.put(chatId, connections);
            this.connectionToChat.put(webSocket, chatId);
        }
    }
}
