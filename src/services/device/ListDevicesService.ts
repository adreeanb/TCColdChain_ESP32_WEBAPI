import { prisma } from '../../lib/prisma.js';
import { getDevicesLastSeen, getOfflineThresholdMinutes, isRecent } from '../../lib/deviceStatus.js';

interface ListDevicesRequest {
  enterpriseId: string;
  includeInactive?: boolean;
}

class ListDevicesService {
  async execute({ enterpriseId, includeInactive = false }: ListDevicesRequest) {
    const devices = await prisma.coldUnitDevice.findMany({
      where: { enterpriseId, ...(includeInactive ? {} : { isActive: true }) },
      orderBy: { macAddress: 'asc' },
      include: {
        // Vínculo atual: endDate nulo
        associations: {
          where: { endDate: null },
          include: {
            coldUnit: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    });

    const lastSeen = await getDevicesLastSeen(devices.map((device) => device.id));

    return devices.map((device) => {
      const lastSeenAt = lastSeen.get(device.id) ?? null;

      return {
        ...device,
        lastSeenAt,
        isOnline: device.isActive && isRecent(lastSeenAt),
        offlineThresholdMinutes: getOfflineThresholdMinutes()
      };
    });
  }
}

export { ListDevicesService };
