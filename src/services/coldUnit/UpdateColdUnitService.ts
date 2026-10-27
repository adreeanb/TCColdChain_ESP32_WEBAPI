import type { ColdUnitType } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

interface UpdateColdUnitRequest {
  id: string;
  type: ColdUnitType;
  minTemperature: number;
  maxTemperature: number;
  licensePlate?: string;
  location?: string;
}

class UpdateColdUnitService {
  async execute({ id, type, minTemperature, maxTemperature, licensePlate, location }: UpdateColdUnitRequest) {
    const coldUnit = await prisma.coldUnit.findFirst({
      where: { id, isDeleted: false }
    });

    if (!coldUnit) {
      throw new Error("Unidade de frio não encontrada.");
    }

    // Se o usuário está tentando mudar a temperatura, verifica se o novo valor é válido
    if (minTemperature !== undefined && (typeof minTemperature !== 'number' || minTemperature < -20 || minTemperature > 10)) {
      throw new Error("Valor inválido para a temperatura mínima. Deve estar entre -20 e 10.");
    }

    if (maxTemperature !== undefined && (typeof maxTemperature !== 'number' || maxTemperature < -20 || maxTemperature > 10)) {
      throw new Error("Valor inválido para a temperatura máxima. Deve estar entre -20 e 10.");
    }

    const updatedColdUnit = await prisma.coldUnit.update({
      where: { id },
      data: {
        type: type || coldUnit.type,
        minTemperature: minTemperature !== undefined ? minTemperature : coldUnit.minTemperature,
        maxTemperature: maxTemperature !== undefined ? maxTemperature : coldUnit.maxTemperature,
        licensePlate: licensePlate || coldUnit.licensePlate,
        location: location || coldUnit.location
      }
    });

    return updatedColdUnit;
  }
}

export { UpdateColdUnitService };