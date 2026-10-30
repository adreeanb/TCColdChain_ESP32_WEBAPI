import { prisma } from '../../lib/prisma.js';
import { Prisma } from '@prisma/client'; // Importante para tipar o WhereInput

interface ListAlertsRequest {
  enterpriseId: string;
  status?: string;
  coldUnitId?: string;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

class ListAlertsService {
  async execute({ enterpriseId, status, coldUnitId, page = 1, pageSize = DEFAULT_PAGE_SIZE }: ListAlertsRequest) {

    // 1. Criamos a base da query tipada com Prisma.AlertWhereInput
    const whereClause: Prisma.AlertWhereInput = {
      coldUnit: {
        enterpriseId: enterpriseId,
        isDeleted: false
      }
    };

    // 2. Adicionamos o filtro de resolvedAt APENAS se houver um status válido,
    // evitando injetar 'undefined' no objeto e quebrar a validação do TypeScript.
    if (status === 'pending') {
      whereClause.resolvedAt = null;
    } else if (status === 'resolved') {
      whereClause.resolvedAt = { not: null };
    }

    if (coldUnitId) {
      whereClause.coldUnitId = coldUnitId;
    }

    const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
    const take = Number.isInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;

    // 3. Executamos a busca com o whereClause limpo
    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        skip: (currentPage - 1) * take,
        take,
        include: {
          coldUnit: {
            select: {
              name: true,
              type: true
            }
          }
        }
      }),
      prisma.alert.count({ where: whereClause })
    ]);

    return { data: alerts, total, page: currentPage, pageSize: take };
  }
}

export { ListAlertsService };
