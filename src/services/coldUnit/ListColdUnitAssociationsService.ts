import { prisma } from '../../lib/prisma.js';

interface ListColdUnitAssociationsRequest {
  id: string;
  enterpriseId: string;
}

class ListColdUnitAssociationsService {
  async execute({ id, enterpriseId }: ListColdUnitAssociationsRequest) {
    const coldUnit = await prisma.coldUnit.findFirst({
      where: { id, enterpriseId, isDeleted: false }
    });

    if (!coldUnit) {
      throw new Error("Unidade fria não encontrada, desativada ou não pertence à sua empresa.");
    }

    const associations = await prisma.associationHistory.findMany({
      where: { coldUnitId: id },
      orderBy: { startDate: 'desc' },
      include: {
        device: {
          select: {
            id: true,
            macAddress: true
          }
        }
      }
    });

    return associations;
  }
}

export { ListColdUnitAssociationsService };
