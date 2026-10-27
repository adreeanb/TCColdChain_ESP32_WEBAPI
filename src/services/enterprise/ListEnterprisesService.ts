import { prisma } from '../../lib/prisma.js';

class ListEnterprisesService {
  async execute() {
    // Busca todas as empresas que não foram deletadas (isDeleted: false)
    const enterprises = await prisma.enterprise.findMany({
      where: {
        isDeleted: false
      },
      orderBy: {
        name: 'asc' // Retorna em ordem alfabética para facilitar no frontend
      }
    });

    return enterprises;
  }
}

export { ListEnterprisesService };