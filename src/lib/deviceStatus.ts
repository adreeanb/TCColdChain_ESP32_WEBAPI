import { prisma } from './prisma.js';

const DEFAULT_OFFLINE_MINUTES = 10;

export function getOfflineThresholdMinutes() {
  const minutes = Number(process.env.SENSOR_OFFLINE_MINUTES);
  return minutes > 0 ? minutes : DEFAULT_OFFLINE_MINUTES;
}

export function isRecent(date: Date | null, now = new Date()) {
  if (!date) {
    return false;
  }

  return now.getTime() - date.getTime() <= getOfflineThresholdMinutes() * 60 * 1000;
}

// Último contato de cada placa. Nas leituras oficiais vale a hora de chegada (createdAt),
// porque um dado store-and-forward tem timestamp antigo mas prova que a placa está viva.
export async function getDevicesLastSeen(deviceIds: string[]) {
  const [readings, unbound] = await Promise.all([
    prisma.temperatureReading.groupBy({
      by: ['deviceId'],
      where: { deviceId: { in: deviceIds } },
      _max: { createdAt: true }
    }),
    prisma.unboundTelemetry.groupBy({
      by: ['deviceId'],
      where: { deviceId: { in: deviceIds } },
      _max: { timestamp: true }
    })
  ]);

  const lastSeen = new Map<string, Date>();

  const register = (deviceId: string, date: Date | null) => {
    const current = lastSeen.get(deviceId);

    if (date && (!current || date > current)) {
      lastSeen.set(deviceId, date);
    }
  };

  readings.forEach((item) => register(item.deviceId, item._max.createdAt));
  unbound.forEach((item) => register(item.deviceId, item._max.timestamp));

  return lastSeen;
}
