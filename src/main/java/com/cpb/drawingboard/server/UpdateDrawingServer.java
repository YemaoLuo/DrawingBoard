package com.cpb.drawingboard.server;

import com.alibaba.fastjson.JSON;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@ServerEndpoint("/updateDrawing")
@Component
@Slf4j
public class UpdateDrawingServer {

    private Session session;

    private static String history = "";

    private static final ConcurrentHashMap<String, String> dataMap = new ConcurrentHashMap<>();

    private static final CopyOnWriteArraySet<UpdateDrawingServer> webSocketSet = new CopyOnWriteArraySet<>();

    @OnOpen
    public void onOpen(Session session) throws IOException {
        this.session = session;
        webSocketSet.add(this);
        log.info("onOpen：{}", webSocketSet.size());
        session.getBasicRemote().sendText(history);
    }

    @OnClose
    public void onClose() {
        webSocketSet.remove(this);
        log.info("onClose：{}", webSocketSet.size());
    }

    @OnMessage
    public void onMessage(String message) {
        Map map = JSON.parseObject(message, Map.class);
        String key = (String) map.get("id");
        String value = (String) map.get("data");
        if (value.equals("END")) {
            sendAllMessage(dataMap.get(key));
            history = dataMap.get(key);
            dataMap.remove(key);
        } else {
            String originalValue = dataMap.getOrDefault(key, "");
            dataMap.put(key, originalValue + value);
        }
    }

    public static void sendAllMessage(String message) {
        log.info("Send Message");
        for (UpdateDrawingServer webSocket : webSocketSet) {
            try {
                webSocket.session.getBasicRemote().sendText(message);
            } catch (IOException e) {
                log.error("Error：" + e.getMessage(), e);
            }
        }
    }
}
