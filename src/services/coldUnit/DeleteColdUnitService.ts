import { prisma } from '../../lib/prisma.js';

interface DeleteColdUnitRequest {
  id: string;
  enterpriseId: string;
}

class DeleteColdUnitService {
  async execute({ id, enterpriseId }: DeleteColdUnitRequest) {
    const coldUnit = await prisma.coldUnit.findFirst({
      where: { id, enterpriseId, isDeleted: false }
    });

    if (!coldUnit) {
      throw new Error("Unidade de frio não encontrada ou já deletada.");
    }

    // Aplica o Soft Delete e encerra os vínculos: as placas voltam para a quarentena
    const [deletedColdUnit] = await prisma.$transaction([
      prisma.coldUnit.update({ where: { id }, data: { isDeleted: true } }),
      prisma.associationHistory.updateMany({
        where: { coldUnitId: id, endDate: null },
        data: { endDate: new Date() }
      })
    ]);

    return deletedColdUnit;
  }
}

export { DeleteColdUnitService };
