import { prisma } from '../../lib/prisma.js';
import { ReadingSourceType } from '@prisma/client';
import { normalizeMacAddress } from '../../lib/macAddress.js';
import { CreateTemperatureReadingService } from './CreateTemperatureReadingService.js';

const QUARANTINE_TTL_HOURS = Number(process.env.QUARANTINE_TTL_HOURS) || 2;

interface IngestTelemetryRequest {
  macAddress: string;
  temperature: number;
  sourceType?: ReadingSourceType;
  timestamp?: string | Date | undefined;
}

// ESP32 sem NTP pode enviar uma data inválida ou no futuro: nesses casos vale a hora de chegada
function resolveTimestamp(timestamp: string | Date | undefined, now: Date) {
  if (!timestamp) {
    return now;
  }

  const parsed = new Date(timestamp);

  return isNaN(parsed.getTime()) || parsed > now ? now : parsed;
}

class IngestTelemetryService {
  async execute({ macAddress, temperature, sourceType = 'REALTIME', timestamp }: IngestTelemetryRequest) {
    const normalizedMac = normalizeMacAddress(macAddress);

    if (!normalizedMac) {
      throw new Error("Endereço MAC inválido.");
    }

    if (typeof temperature !== 'number' || !Number.isFinite(temperature)) {
      throw new Error("Temperatura inválida.");
    }

    // 1. Placas não cadastradas ou desativadas têm os dados descartados
    const device = await prisma.coldUnitDevice.findUnique({
      where: { macAddress: normalizedMac }
    });

    if (!device || !device.isActive) {
      console.warn(`[TELEMETRIA DESCARTADA] Placa desconhecida ou inativa: ${normalizedMac}`);
      return { status: 'DISCARDED' as const };
    }

    const now = new Date();
    const readingTime = resolveTimestamp(timestamp, now);

    // 2. Busca o vínculo vigente na data da leitura, não na data de chegada:
    // um dado Store & Forward enviado depois de uma troca continua na unidade correta
    const association = await prisma.associationHistory.findFirst({
      where: {
        deviceId: device.id,
        startDate: { lte: readingTime },
        OR: [{ endDate: null }, { endDate: { gt: readingTime } }],
        coldUnit: { isDeleted: false }
      },
      orderBy: { startDate: 'desc' }
    });

    // 3. Sem vínculo, o dado fica retido na quarentena
    if (!association) {
      const unboundTelemetry = await prisma.unboundTelemetry.create({
        data: {
          deviceId: device.id,
          temperature,
          timestamp: readingTime,
          expiresAt: new Date(now.getTime() + QUARANTINE_TTL_HOURS * 60 * 60 * 1000)
        }
      });

      return { status: 'QUARANTINED' as const, unboundTelemetry };
    }

    const createTemperatureReadingService = new CreateTemperatureReadingService();

    const reading = await createTemperatureReadingService.execute({
      coldUnitId: association.coldUnitId,
      deviceId: device.id,
      temperature,
      sourceType,
      timestamp: readingTime
    });

    return { status: 'STORED' as const, reading };
  }
}

export { IngestTelemetryService };
