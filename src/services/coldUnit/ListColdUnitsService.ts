import { prisma } from '../../lib/prisma.js';

class ListColdUnitsService {
  async execute() {
    // Busca todas as unidades de frio que não foram deletadas (isDeleted: false)
    const coldUnits = await prisma.coldUnit.findMany({
      where: {
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