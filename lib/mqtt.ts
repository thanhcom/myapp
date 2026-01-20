import { store } from "@/store";
import mqtt from "mqtt";
import {
  setCheckStatus,
  setConnected,
  setHumi,
  setRssid,
  setTemp,
} from "../store/mqttSlice";

let client: mqtt.MqttClient | null = null;

/* =========================
   SUBSCRIBED TOPIC STORE
========================= */
const subscribedTopics = new Map<string, 0 | 1 | 2>();

/* =========================
   CONNECT
========================= */
export const connectMqtt = () => {
  if (client) return;

  client = mqtt.connect("ws://thanhcom1989.ddns.net:9001", {
    username: "thanhcom",
    password: "laodaicaha",
    clean: true,
    connectTimeout: 4000,
  });

  client.on("connect", () => {
    console.log("✅ MQTT connected");
    store.dispatch(setConnected(true));

    // Re-sub toàn bộ topic đã lưu
    if (subscribedTopics.size > 0) {
      subscribeMQTT([...subscribedTopics.entries()]);
    }
  });

  client.on("message", (topic, message) => {
    const payload = message.toString();

    switch (topic) {
      case "blynk/temp":
        store.dispatch(setTemp(Number(payload)));
        break;
      case "blynk/humi":
        store.dispatch(setHumi(Number(payload)));
        break;
      case "blynk/rssid":
        store.dispatch(setRssid(payload));
        break;
      case "blynk/checkstatus":
        store.dispatch(setCheckStatus(payload));
        break;
    }
  });

  client.on("close", () => {
    console.log("❌ MQTT closed");
    store.dispatch(setConnected(false));
  });

  client.on("error", (err) => {
    console.log("❌ MQTT error:", err);
  });
};

/* =========================
   SUBSCRIBE
========================= */
export function subscribeMQTT(
  topics: string | string[] | [string, 0 | 1 | 2][],
  qos: 0 | 1 | 2 = 0,
) {
  if (!client || !client.connected) {
    console.log("⚠️ MQTT chưa kết nối");
    return;
  }

  let topicMap: Record<string, { qos: 0 | 1 | 2 }> = {};

  if (typeof topics === "string") {
    if (subscribedTopics.has(topics)) return;
    subscribedTopics.set(topics, qos);
    topicMap[topics] = { qos };
  } else if (Array.isArray(topics)) {
    topics.forEach((t) => {
      const topic = Array.isArray(t) ? t[0] : t;
      const q = Array.isArray(t) ? t[1] : qos;

      if (!subscribedTopics.has(topic)) {
        subscribedTopics.set(topic, q);
        topicMap[topic] = { qos: q };
      }
    });
  }

  if (Object.keys(topicMap).length === 0) return;

  client.subscribe(topicMap, (err) => {
    if (err) {
      console.log("❌ Subscribe error:", err);
    } else {
      console.log("📡 Subscribed:", Object.keys(topicMap));
    }
  });
}

/* =========================
   UNSUBSCRIBE
========================= */
export function unsubscribeMQTT(topics: string | string[]) {
  if (!client || !client.connected) {
    console.log("⚠️ MQTT chưa kết nối");
    return;
  }

  const topicList = Array.isArray(topics) ? topics : [topics];

  client.unsubscribe(topicList, (err) => {
    if (err) {
      console.log("❌ Unsubscribe error:", err);
    } else {
      topicList.forEach((t) => subscribedTopics.delete(t));
      console.log("🚫 Unsubscribed:", topicList);
    }
  });
}

/* =========================
   GET SUBSCRIBED LIST
========================= */
export function getSubscribedTopics() {
  return Array.from(subscribedTopics.entries()).map(([topic, qos]) => ({
    topic,
    qos,
  }));
}

/* =========================
   PUBLISH
========================= */
export function publishMQTT(topic: string, payload: string) {
  if (!client || !client.connected) {
    console.log("⚠️ MQTT chưa kết nối");
    return;
  }

  client.publish(topic, payload, { qos: 0 }, (err) => {
    if (err) {
      console.log("❌ Publish error", err);
    } else {
      console.log("📤 Published:", topic, payload);
    }
  });
}

/* =========================
   DISCONNECT
========================= */
export function disconnectMqtt() {
  if (client) {
    client.end(() => {
      console.log("🔌 MQTT disconnected");
      client = null;
      subscribedTopics.clear();
    });
  }
}
