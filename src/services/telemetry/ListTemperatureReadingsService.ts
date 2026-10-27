import { prisma } from '../../lib/prisma.js'; 

interface ListTemperatureReadingsRequest {
  coldUnitId: string;
  enterpriseId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

class ListTemperatureReadingsService {
  async execute({ coldUnitId, enterpriseId, startDate, endDate, limit = 100 }: ListTemperatureReadingsRequest) {
    
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

    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp.gte = new Date(startDate);
      if (endDate) whereClause.timestamp.lte = new Date(endDate);
    }

    // 3. Busca das leituras com filtros, limites e ordenação
    const readings = await prisma.temperatureReading.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'desc' 
      },
      take: limit,
    });

    return readings;
  }
}

export { ListTemperatureReadingsService };