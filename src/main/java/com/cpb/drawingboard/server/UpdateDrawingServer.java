package com.cpb.drawingboard.server;

import com.alibaba.fastjson.JSON;
import com.cpb.drawingboard.util.GzipUtils;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/updateDrawing/{id}")
@Component
@Slf4j
public class UpdateDrawingServer {

    private static final ConcurrentHashMap<String, String> history = new ConcurrentHashMap<>();

    private static final ConcurrentHashMap<String, ConcurrentHashMap<String, String>> dataMap = new ConcurrentHashMap<>();

    private static final ConcurrentHashMap<String, Set<Session>> webSocketMap = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("id") String id) throws IOException {
        if (webSocketMap.containsKey(id)) {
            webSocketMap.get(id).add(session);
        } else {
            Set<Session> set = new HashSet<>();
            set.add(session);
            webSocketMap.put(id, set);
        }
        log.info("onOpen " + id + "：{}", webSocketMap.get(id).size());
        if (history.containsKey(id)) {
            session.getBasicRemote().sendText(history.get(id));
        }
    }

    @OnClose
    public void onClose(@PathParam("id") String id) {
        webSocketMap.get(id).remove(this);
        log.info("onClose " + id + "：{}", webSocketMap.get(id).size());
    }

    @OnMessage
    public void onMessage(String message, @PathParam("id") String id) {
        Map map = JSON.parseObject(message, Map.class);
        String key = (String) map.get("id");
        String value = (String) map.get("data");
        if (value.equals("END")) {
            ConcurrentHashMap<String, String> map1 = dataMap.get(id);
            history.put(id, map1.get(key));
            sendAllMessage(map1.get(key), id);
            map1.remove(key);
        } else {
            if (dataMap.containsKey(id)) {
                if (dataMap.get(id).containsKey(key)) {
                    ConcurrentHashMap<String, String> map1 = dataMap.get(id);
                    map1.put(key, map1.get(key) + value);
                } else {
                    ConcurrentHashMap<String, String> map1 = new ConcurrentHashMap<>();
                    map1.put(key, value);
                    dataMap.put(id, map1);
                }
            } else {
                ConcurrentHashMap<String, String> map1 = new ConcurrentHashMap<>();
                map1.put(key, value);
                dataMap.put(id, map1);
            }
        }
    }

    public static void sendAllMessage(String message, String id) {
        log.info("Send Message " + id);
        Set<Session> sessionSet = webSocketMap.get(id);
        for (Session webSocket : sessionSet) {
            try {
                byte[] compressed = GzipUtils.compressString(message);
                webSocket.getBasicRemote().sendObject(compressed);
            } catch (Exception e) {
                sessionSet.remove(webSocket);
            }
        }
    }
}
