import { prisma } from '../../lib/prisma.js';

class DeleteEnterpriseService {
  async execute(id: string) {
    const enterprise = await prisma.enterprise.findFirst({
      where: { id, isDeleted: false }
    });

    if (!enterprise) {
      throw new Error("Empresa não encontrada ou já deletada.");
    }

    // Aplica o Soft Delete na empresa, nos usuários e nas unidades de frio de forma atômica,
    // encerrando os vínculos e desativando as placas da empresa
    const [deletedEnterprise] = await prisma.$transaction([
      prisma.enterprise.update({ where: { id }, data: { isDeleted: true } }),
      prisma.user.updateMany({ where: { enterpriseId: id }, data: { isDeleted: true } }),
      prisma.coldUnit.updateMany({ where: { enterpriseId: id }, data: { isDeleted: true } }),
      prisma.associationHistory.updateMany({
        where: { device: { enterpriseId: id }, endDate: null },
        data: { endDate: new Date() }
      }),
      prisma.coldUnitDevice.updateMany({ where: { enterpriseId: id }, data: { isActive: false } })
    ]);

    return deletedEnterprise;
  }
}

export { DeleteEnterpriseService };