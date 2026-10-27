import { prisma } from '../../lib/prisma.js';

class GetEnterpriseService {
  async execute(id: string) {
    const enterprise = await prisma.enterprise.findFirst({
      where: {
        id: id,
        isDeleted: false
      }
    });

    if (!enterprise) {
      throw new Error("Empresa não encontrada ou inativa.");
    }

    return enterprise;
  }
}

export { GetEnterpriseService };