import { prisma } from '../../lib/prisma.js';

interface EnterpriseRequest {
  name: string;
  cnpj: string;
}

class CreateEnterpriseService {
  async execute({ name, cnpj }: EnterpriseRequest) {
    if (!name || !cnpj) {
      throw new Error("Nome e CNPJ são obrigatórios.");
    }

    // Verifica se o CNPJ já está cadastrado (mesmo que deletado logicamente, o CNPJ é único)
    const enterpriseAlreadyExists = await prisma.enterprise.findUnique({
      where: { cnpj }
    });

    if (enterpriseAlreadyExists) {
      throw new Error("Já existe uma empresa cadastrada com este CNPJ.");
    }

    const enterprise = await prisma.enterprise.create({
      data: {
        name,
        cnpj
      }
    });

    return enterprise;
  }
}

export { CreateEnterpriseService };