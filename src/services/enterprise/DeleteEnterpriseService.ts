import { prisma } from '../../lib/prisma.js';

class DeleteEnterpriseService {
  async execute(id: string) {
    const enterprise = await prisma.enterprise.findFirst({
      where: { id, isDeleted: false }
    });

    if (!enterprise) {
      throw new Error("Empresa não encontrada ou já deletada.");
    }

    // Aplica o Soft Delete 
    const deletedEnterprise = await prisma.enterprise.delete({
      where: { id }
    });

    return deletedEnterprise;
  }
}

export { DeleteEnterpriseService };