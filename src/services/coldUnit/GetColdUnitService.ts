import { prisma } from '../../lib/prisma.js';

class GetColdUnitService {
  async execute(id: string) {
    const coldUnit = await prisma.coldUnit.findFirst({
      where: {
        id: id,
        isDeleted: false
      }
    });

    if (!coldUnit) {
      throw new Error("Unidade de frio não encontrada ou inativa.");
    }

    return coldUnit;
  }
}

export { GetColdUnitService };