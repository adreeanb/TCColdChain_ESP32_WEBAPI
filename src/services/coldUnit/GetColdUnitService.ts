import { prisma } from '../../lib/prisma.js';

interface GetColdUnitRequest {
  id: string;
  enterpriseId: string;
}

class GetColdUnitService {
  async execute({ id, enterpriseId }: GetColdUnitRequest) {
    const coldUnit = await prisma.coldUnit.findFirst({
      where: {
        id: id,
        enterpriseId: enterpriseId,
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