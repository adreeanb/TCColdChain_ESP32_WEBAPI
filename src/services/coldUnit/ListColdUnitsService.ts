import { prisma } from '../../lib/prisma.js';

class ListColdUnitsService {
  async execute(enterpriseId: string) {
    // Busca as unidades de frio da empresa que não foram deletadas (isDeleted: false)
    const coldUnits = await prisma.coldUnit.findMany({
      where: {
        enterpriseId: enterpriseId,
        isDeleted: false
      },
      orderBy: {
        name: 'asc' // Retorna em ordem alfabética para facilitar no frontend
      }
    });

    return coldUnits;
  }
}

export { ListColdUnitsService };