import { prisma } from '../../lib/prisma.js';
import { getDevicesLastSeen, getOfflineThresholdMinutes, isRecent } from '../../lib/deviceStatus.js';

type ColdUnitStatus = 'NORMAL' | 'OUT_OF_RANGE' | 'NO_SIGNAL' | 'NO_DEVICE';

interface LatestReadingRow {
  coldUnitId: string;
  deviceId: string;
  temperature: number;
  sourceType: string;
  timestamp: string;
}

class GetDashboardSummaryService {
  async execute(enterpriseId: string) {
    const now = new Date();

    const coldUnits = await prisma.coldUnit.findMany({
      where: { enterpriseId },
      orderBy: { name: 'asc' },
      include: {
        associations: {
          where: { endDate: null },
          include: { device: { select: { id: true, macAddress: true } } }
        }
      }
    });

    const coldUnitIds = coldUnits.map((coldUnit) => coldUnit.id);
    const deviceIds = coldUnits.flatMap((coldUnit) => coldUnit.associations.map((item) => item.deviceId));

    // Última leitura de cada placa em cada unidade. Com várias placas, olhar só a
    // leitura mais recente da unidade esconderia uma placa fora dos limites.
    const [latestReadings, pendingAlerts, lastSeen, quarantined] = await Promise.all([
      prisma.$queryRaw<LatestReadingRow[]>`
        SELECT DISTINCT ON (cold_unit_id, device_id)
          cold_unit_id AS "coldUnitId",
          device_id AS "deviceId",
          temperature,
          source_type::text AS "sourceType",
          to_char(timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS timestamp
        FROM temperature_readings
        WHERE cold_unit_id = ANY(${coldUnitIds})
        ORDER BY cold_unit_id, device_id, temperature_readings.timestamp DESC
      `,
      prisma.alert.groupBy({
        by: ['coldUnitId'],
        where: { resolvedAt: null, coldUnitId: { in: coldUnitIds } },
        _count: { _all: true }
      }),
      getDevicesLastSeen(deviceIds),
      prisma.unboundTelemetry.groupBy({
        by: ['deviceId'],
        where: { expiresAt: { gt: now }, device: { enterpriseId } }
      })
    ]);

    const units = coldUnits.map((coldUnit) => {
      const { associations, ...unit } = coldUnit;

      const devices = associations.map(({ device }) => {
        const lastSeenAt = lastSeen.get(device.id) ?? null;
        const row = latestReadings.find(
          (reading) => reading.coldUnitId === unit.id && reading.deviceId === device.id
        );

        return {
          id: device.id,
          macAddress: device.macAddress,
          lastSeenAt,
          isOnline: isRecent(lastSeenAt, now),
          // O texto em UTC vira Date aqui, sem depender do fuso da sessão do banco
          lastReading: row ? { ...row, timestamp: new Date(row.timestamp) } : null
        };
      });

      const isOutOfRange = devices.some(({ lastReading }) =>
        lastReading !== null &&
        isRecent(lastReading.timestamp, now) &&
        (lastReading.temperature < unit.minTemperature || lastReading.temperature > unit.maxTemperature)
      );

      let status: ColdUnitStatus = 'NORMAL';

      if (devices.length === 0) {
        status = 'NO_DEVICE';
      } else if (isOutOfRange) {
        status = 'OUT_OF_RANGE';
      } else if (devices.some((device) => !device.isOnline)) {
        status = 'NO_SIGNAL';
      }

      const lastReading = devices
        .map((device) => device.lastReading)
        .filter((reading) => reading !== null)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] ?? null;

      return {
        ...unit,
        status,
        lastReading,
        devices,
        pendingAlerts: pendingAlerts.find((item) => item.coldUnitId === unit.id)?._count._all ?? 0
      };
    });

    const countByStatus = (status: ColdUnitStatus) => units.filter((unit) => unit.status === status).length;

    return {
      generatedAt: now,
      offlineThresholdMinutes: getOfflineThresholdMinutes(),
      totals: {
        units: units.length,
        normal: countByStatus('NORMAL'),
        outOfRange: countByStatus('OUT_OF_RANGE'),
        noSignal: countByStatus('NO_SIGNAL'),
        noDevice: countByStatus('NO_DEVICE'),
        pendingAlerts: units.reduce((total, unit) => total + unit.pendingAlerts, 0),
        quarantinedDevices: quarantined.length
      },
      units
    };
  }
}

export { GetDashboardSummaryService };
