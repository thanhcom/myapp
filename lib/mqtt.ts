import mqtt from 'mqtt';

let client: mqtt.MqttClient | null = null;

type MessageHandler = (value: string) => void;
let onTempMessage: MessageHandler | null = null;

export function connectMQTT(onMessage: MessageHandler) {
  onTempMessage = onMessage;

  if (client) return;

  client = mqtt.connect('ws://thanhcom1989.ddns.net:9001', {
    clientId: 'expo_' + Math.random().toString(16).slice(2),
    username: 'thanhcom',
    password: 'laodaicaha',
    clean: true,
    keepalive: 60,
    reconnectPeriod: 3000,
  });

  client.on('connect', () => {
    console.log('✅ MQTT connected');
    client?.subscribe('blynk/temp', { qos: 0 });
  });

  client.on('message', (topic, message) => {
    if (topic === 'blynk/temp') {
      const value = message.toString();
      console.log('🌡 TEMP:', value);
      onTempMessage?.(value);
    }
  });

  client.on('error', (err) => {
    console.log('❌ MQTT error:', err.message);
  });
}

export function publishMQTT(topic: string, payload: string) {
  if (!client) return;
  client.publish(topic, payload, { qos: 0, retain: false });
}

export function disconnectMQTT() {
  client?.end();
  client = null;
}
