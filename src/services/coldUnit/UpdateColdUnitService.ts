import type { ColdUnitType } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

interface UpdateColdUnitRequest {
  id: string;
  enterpriseId: string;
  name?: string;
  type?: ColdUnitType;
  minTemperature?: number;
  maxTemperature?: number;
  licensePlate?: string | null;
  isFixedLocation?: boolean;
  location?: string | null;
}

class UpdateColdUnitService {
  async execute({ id, enterpriseId, name, type, minTemperature, maxTemperature, licensePlate, isFixedLocation, location }: UpdateColdUnitRequest) {
    const coldUnit = await prisma.coldUnit.findFirst({
      where: { id, enterpriseId, isDeleted: false }
    });

    if (!coldUnit) {
      throw new Error("Unidade de frio não encontrada.");
    }

    if (minTemperature !== undefined && typeof minTemperature !== 'number') {
      throw new Error("Valor inválido para a temperatura mínima.");
    }

    if (maxTemperature !== undefined && typeof maxTemperature !== 'number') {
      throw new Error("Valor inválido para a temperatura máxima.");
    }

    const newMinTemperature = minTemperature ?? coldUnit.minTemperature;
    const newMaxTemperature = maxTemperature ?? coldUnit.maxTemperature;

    // Mesma regra da criação
    if (newMinTemperature >= newMaxTemperature) {
      throw new Error("Temperatura mínima não pode ser maior ou igual à máxima.");
    }

    const updatedColdUnit = await prisma.coldUnit.update({
      where: { id },
      data: {
        name: name || coldUnit.name,
        type: type || coldUnit.type,
        minTemperature: newMinTemperature,
        maxTemperature: newMaxTemperature,
        // undefined mantém o valor atual; null ou vazio limpa o campo
        licensePlate: licensePlate === undefined ? coldUnit.licensePlate : licensePlate || null,
        isFixedLocation: isFixedLocation ?? coldUnit.isFixedLocation,
        location: location === undefined ? coldUnit.location : location || null
      }
    });

    return updatedColdUnit;
  }
}

export { UpdateColdUnitService };
