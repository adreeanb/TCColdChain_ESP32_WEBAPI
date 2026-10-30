import { prisma } from '../../lib/prisma.js'; 

interface ResolveAlertRequest {
  alertId: string;
  enterpriseId: string;
}

class ResolveAlertService {
  async execute({ alertId, enterpriseId }: ResolveAlertRequest) {
    // 1. Validação de Segurança (IDOR): O alerta pertence a uma máquina dessa empresa?
    const alertExists = await prisma.alert.findFirst({
      where: { 
        id: alertId, 
        resolvedAt: null, // Garante que ainda não foi resolvido
        coldUnit: {
          enterpriseId: enterpriseId,
          isDeleted: false
        }
      }
    });

    if (!alertExists) {
      // Mensagem genérica por segurança (não confirma se o ID existe em outra empresa)
      throw new Error("Alerta não encontrado, já resolvido ou acesso negado.");
    }

    // 2. Resolve o alerta se a validação passar
    const resolvedAlert = await prisma.alert.update({
      where: { 
        id: alertId 
      },
      data: { 
        resolvedAt: new Date() 
      }
    });

    return resolvedAlert;
  }
}

export { ResolveAlertService };