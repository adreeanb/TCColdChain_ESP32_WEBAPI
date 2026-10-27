import { prisma } from '../../lib/prisma.js'; 
import { Prisma } from '@prisma/client'; // Importante para tipar o WhereInput

interface ListAlertsRequest {
  enterpriseId: string;
  status?: string;
}

class ListAlertsService {
  async execute({ enterpriseId, status }: ListAlertsRequest) {
    
    // 1. Criamos a base da query tipada com Prisma.AlertWhereInput
    const whereClause: Prisma.AlertWhereInput = {
      coldUnit: {
        enterpriseId: enterpriseId 
      }
    };

    // 2. Adicionamos o filtro de resolvedAt APENAS se houver um status válido,
    // evitando injetar 'undefined' no objeto e quebrar a validação do TypeScript.
    if (status === 'pending') {
      whereClause.resolvedAt = null;
    } else if (status === 'resolved') {
      whereClause.resolvedAt = { not: null };
    }

    // 3. Executamos a busca com o whereClause limpo
    const alerts = await prisma.alert.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        coldUnit: {
          select: {
            name: true,
            type: true
          }
        }
      }
    });

    return alerts;
  }
}

export { ListAlertsService };