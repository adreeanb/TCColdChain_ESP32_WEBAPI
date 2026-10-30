import { prisma } from '../../lib/prisma.js';

class ListUnboundDevicesService {
  async execute(enterpriseId: string) {
    // Dados retidos e ainda não expirados, agrupados por placa
    const pending = await prisma.unboundTelemetry.groupBy({
      by: ['deviceId'],
      where: {
        expiresAt: { gt: new Date() },
        device: { enterpriseId }
      },
      _count: { _all: true },
      _max: { timestamp: true },
      _min: { expiresAt: true }
    });

    const devices = await prisma.coldUnitDevice.findMany({
      where: { id: { in: pending.map((item) => item.deviceId) } },
      select: { id: true, macAddress: true }
    });

    return pending.map((item) => ({
      deviceId: item.deviceId,
      macAddress: devices.find((device) => device.id === item.deviceId)?.macAddress,
      pendingReadings: item._count._all,
      lastReadingAt: item._max.timestamp,
      nextExpirationAt: item._min.expiresAt
    }));
  }
}

export { ListUnboundDevicesService };
