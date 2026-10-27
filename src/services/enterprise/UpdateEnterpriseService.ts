import { prisma } from '../../lib/prisma.js';

interface UpdateEnterpriseRequest {
  id: string;
  name?: string;
  cnpj?: string;
}

class UpdateEnterpriseService {
  async execute({ id, name, cnpj }: UpdateEnterpriseRequest) {
    const enterprise = await prisma.enterprise.findFirst({
      where: { id, isDeleted: false }
    });

    if (!enterprise) {
      throw new Error("Empresa não encontrada.");
    }

    // Se o usuário está tentando mudar o CNPJ, verifica se o novo CNPJ já existe em outra empresa
    if (cnpj && cnpj !== enterprise.cnpj) {
      const cnpjInUse = await prisma.enterprise.findUnique({
        where: { cnpj }
      });

      if (cnpjInUse) {
        throw new Error("Este CNPJ já está em uso por outra empresa.");
      }
    }

    const updatedEnterprise = await prisma.enterprise.update({
      where: { id },
      data: {
        name: name || enterprise.name,
        cnpj: cnpj || enterprise.cnpj
      }
    });

    return updatedEnterprise;
  }
}

export { UpdateEnterpriseService };