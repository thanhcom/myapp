import { store } from '@/store';
import mqtt from 'mqtt';
import {
  setCheckStatus,
  setConnected,
  setHumi,
  setRssid,
  setTemp,
} from '../store/mqttSlice';

let client: mqtt.MqttClient | null = null;

export const connectMqtt = () => {
  if (client) return;

  client = mqtt.connect('ws://thanhcom1989.ddns.net:9001', {
    username: 'thanhcom',
    password: 'laodaicaha',
    clean: true,
    connectTimeout: 4000,
  });

  client.on('connect', () => {
    console.log('MQTT connected');
    store.dispatch(setConnected(true));

    client?.subscribe([
      'blynk/temp',
      'blynk/humi',
      'blynk/rssid',
      'blynk/checkstatus',
    ]);
  });

  client.on('message', (topic, message) => {
    const payload = message.toString();
    //console.log(topic, payload);

    switch (topic) {
      case 'blynk/temp':
        store.dispatch(setTemp(Number(payload)));
        break;

      case 'blynk/humi':
        store.dispatch(setHumi(Number(payload)));
        break;

      case 'blynk/rssid':
        store.dispatch(setRssid(payload));
        break;

      case 'blynk/checkstatus':
        store.dispatch(setCheckStatus(payload));
        break;
    }
  });

  client.on('close', () => {
    store.dispatch(setConnected(false));
  });

  client.on('error', (err) => {
    console.log('MQTT error:', err);
  });
};

export function publishMQTT(topic: string, payload: string) {
  if (!client || !client.connected) {
    console.log('⚠️ MQTT chưa kết nối');
    return;
  }

  client.publish(topic, payload, { qos: 0 }, (err) => {
    if (err) {
      console.log('❌ Publish error', err);
    } else {
      console.log('📤 Published:', topic, payload);
    }
  });
}
export function disconnectMqtt() {
  if (client) {
    client.end(() => {
      console.log('MQTT disconnected');
      client = null;
    });
  }
}
