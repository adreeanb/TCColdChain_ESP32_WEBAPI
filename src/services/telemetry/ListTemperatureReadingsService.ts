import { prisma } from '../../lib/prisma.js';

interface ListTemperatureReadingsRequest {
  coldUnitId: string;
  enterpriseId: string;
  deviceId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 5000;

class ListTemperatureReadingsService {
  async execute({ coldUnitId, enterpriseId, deviceId, startDate, endDate, limit = DEFAULT_LIMIT }: ListTemperatureReadingsRequest) {

    const coldUnit = await prisma.coldUnit.findFirst({
      where: {
        id: coldUnitId,
        enterpriseId: enterpriseId,
        isDeleted: false
      }
    });

    if (!coldUnit) {
      throw new Error("Unidade fria não encontrada, desativada ou não pertence à sua empresa.");
    }

    // 2. Construção dinâmica dos filtros de data
    const whereClause: any = {
      coldUnitId: coldUnitId,
    };

    if (deviceId) whereClause.deviceId = deviceId;

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime()))) {
        throw new Error("Período inválido em startDate ou endDate.");
      }

      whereClause.timestamp = {};
      if (start) whereClause.timestamp.gte = start;
      if (end) whereClause.timestamp.lte = end;
    }

    const take = Number.isInteger(limit) && limit > 0 ? Math.min(limit, MAX_LIMIT) : DEFAULT_LIMIT;

    // 3. Busca das leituras com filtros, limites e ordenação
    const readings = await prisma.temperatureReading.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'desc'
      },
      take,
      include: {
        device: {
          select: {
            macAddress: true
          }
        }
      }
    });

    return readings;
  }
}

export { ListTemperatureReadingsService };
