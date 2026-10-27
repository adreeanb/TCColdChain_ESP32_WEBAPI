import { prisma } from '../../lib/prisma.js'; 
import { ColdUnitType } from '@prisma/client';

interface ColdUnitRequest {
  name: string;
  type: ColdUnitType;
  minTemperature: number;
  maxTemperature: number;
  licensePlate?: string;
  location?: string;
  enterpriseId: string; // vem do token de quem cria
}

class CreateColdUnitService {
  async execute({ name, type, minTemperature, maxTemperature, licensePlate, location, enterpriseId }: ColdUnitRequest) {
    
    if (!name || !type) {
      throw new Error("Nome e Tipo são obrigatórios.");
    }

    if (minTemperature >= maxTemperature) {
      throw new Error("Temperatura mínima não pode ser maior ou igual à máxima.");
    }

    // Cria no banco amarrado à empresa do usuário
    const coldUnit = await prisma.coldUnit.create({
    data: {
        name,
        type,
        minTemperature,
        maxTemperature,
        enterpriseId,
        licensePlate: licensePlate ?? null, // Converte undefined para null
        location: location ?? null,         // Converte undefined para null
    },
    });

    return coldUnit;
  }
}

export { CreateColdUnitService };