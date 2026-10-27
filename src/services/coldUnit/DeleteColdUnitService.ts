import { prisma } from '../../lib/prisma.js';

class DeleteColdUnitService {
  async execute(id: string) {
    const coldUnit = await prisma.coldUnit.findFirst({
      where: { id, isDeleted: false }
    });

    if (!coldUnit) {
      throw new Error("Unidade de frio não encontrada ou já deletada.");
    }

    // Aplica o Soft Delete 
    const deletedColdUnit = await prisma.coldUnit.delete({
      where: { id }
    });

    return deletedColdUnit;
  }
}

export { DeleteColdUnitService };