import { prisma } from '../../lib/prisma.js';
import { normalizeMacAddress } from '../../lib/macAddress.js';
import { buildTemperatureAlert } from '../telemetry/CreateTemperatureReadingService.js';

interface BindDeviceRequest {
  macAddress: string;
  coldUnitId: string;
  enterpriseId: string;
}

class BindDeviceService {
  async execute({ macAddress, coldUnitId, enterpriseId }: BindDeviceRequest) {
    const normalizedMac = normalizeMacAddress(macAddress);

    if (!normalizedMac) {
      throw new Error("Endereço MAC inválido.");
    }

    // 1. Validação de Segurança: placa e unidade precisam ser da empresa do usuário
    const device = await prisma.coldUnitDevice.findFirst({
      where: { macAddress: normalizedMac, enterpriseId, isActive: true }
    });

    if (!device) {
      throw new Error("Placa não encontrada, desativada ou não pertence à sua empresa.");
    }

    const coldUnit = await prisma.coldUnit.findFirst({
      where: { id: coldUnitId, enterpriseId, isDeleted: false }
    });

    if (!coldUnit) {
      throw new Error("Unidade fria não encontrada, desativada ou não pertence à sua empresa.");
    }

    try {
      return await prisma.$transaction(async (tx) => {
        const now = new Date();

        const activeAssociation = await tx.associationHistory.findFirst({
          where: { deviceId: device.id, endDate: null }
        });

        // 2. Reescanear a placa na mesma unidade não cria histórico
        if (activeAssociation?.coldUnitId === coldUnitId) {
          return { association: activeAssociation, recoveredReadings: 0 };
        }

        // 3. Encerra o vínculo antigo e inicia o novo
        await tx.associationHistory.updateMany({
          where: { deviceId: device.id, endDate: null },
          data: { endDate: now }
        });

        const association = await tx.associationHistory.create({
          data: { deviceId: device.id, coldUnitId, startDate: now }
        });

        // 4. Resgata a quarentena para a unidade, mantendo o horário original das leituras
        const unboundTelemetries = await tx.unboundTelemetry.findMany({
          where: { deviceId: device.id, expiresAt: { gt: now } },
          orderBy: { timestamp: 'asc' }
        });

        await tx.temperatureReading.createMany({
          data: unboundTelemetries.map((item) => ({
            coldUnitId,
            deviceId: device.id,
            temperature: item.temperature,
            sourceType: 'HISTORICAL' as const,
            timestamp: item.timestamp
          }))
        });

        const alerts = unboundTelemetries
          .map((item) => buildTemperatureAlert(coldUnit, item.temperature))
          .filter((alert) => alert !== null);

        await tx.alert.createMany({ data: alerts });

        // Apaga só o que foi copiado: uma mensagem que chegue agora não pode se perder
        await tx.unboundTelemetry.deleteMany({
          where: { id: { in: unboundTelemetries.map((item) => item.id) } }
        });

        return { association, recoveredReadings: unboundTelemetries.length };
      });
    } catch (error: any) {
      // Índice único parcial: dois vínculos simultâneos para a mesma placa
      if (error.code === 'P2002') {
        throw new Error("Esta placa acabou de ser vinculada por outra requisição. Tente novamente.");
      }

      throw error;
    }
  }
}

export { BindDeviceService };
