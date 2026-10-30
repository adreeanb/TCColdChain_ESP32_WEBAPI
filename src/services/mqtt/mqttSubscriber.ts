import mqtt from 'mqtt';
import { IngestTelemetryService } from '../telemetry/IngestTelemetryService.js';
import { ReadingSourceType } from '@prisma/client';

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883';

const TOPIC_REALTIME = 'tcc/adrian/temperatura';
const TOPIC_HISTORICAL = 'tcc/adrian/temperatura/historico';

export function iniciarMQTTSubscriber() {
  const client = mqtt.connect(BROKER_URL, {
    clientId: `node_backend_subscriber_${Math.random().toString(16).substring(2, 8)}`,
  });

  // Instancia o Service que decide entre leitura oficial e quarentena
  const ingestTelemetryService = new IngestTelemetryService();

  client.on('connect', () => {
    console.log('✅ Backend conectado ao Broker MQTT!');

    client.subscribe([TOPIC_REALTIME, TOPIC_HISTORICAL], (err) => {
      if (!err) {
        console.log('📡 Inscrito nos tópicos:');
        console.log(`   - ${TOPIC_REALTIME} (REALTIME)`);
        console.log(`   - ${TOPIC_HISTORICAL} (STORE & FORWARD)`);
      } else {
        console.error('❌ Erro ao se inscrever nos tópicos:', err);
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      // Payload: { "mac": "AA:BB:CC:DD:EE:FF", "temperatura": 4.2, "timestamp": "2026-10-30T12:00:00Z" }
      // O timestamp é opcional; sem ele, vale a hora de chegada
      const dadosJson = JSON.parse(message.toString());

      const result = await ingestTelemetryService.execute({
        macAddress: dadosJson.mac,
        temperature: parseFloat(dadosJson.temperatura),
        sourceType: topic === TOPIC_HISTORICAL ? ReadingSourceType.HISTORICAL : ReadingSourceType.REALTIME,
        timestamp: dadosJson.timestamp
      });

      console.log(`[MQTT -> SERVICE] ${result.status}: ${dadosJson.mac} ${dadosJson.temperatura} °C`);
    } catch (error: any) {
      // Captura payloads inválidos e erros do Service
      console.error(`❌ Erro MQTT ao processar tópico ${topic}:`, error.message);
    }
  });

  client.on('error', (err) => {
    console.error('❌ Erro no cliente MQTT:', err);
  });
}
