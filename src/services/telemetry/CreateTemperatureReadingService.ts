import { prisma } from '../../lib/prisma.js';
import { ReadingSourceType } from '@prisma/client';

interface TelemetryRequest {
  coldUnitId: string;
  deviceId: string;
  temperature: number;
  sourceType?: ReadingSourceType; // REALTIME ou HISTORICAL (Store & Forward)
  timestamp?: Date;
}

interface ColdUnitLimits {
  id: string;
  minTemperature: number;
  maxTemperature: number;
}

// REGRA DE NEGÓCIO: Verificação de Quebra da Cadeia de Frio. Retorna null se a temperatura estiver dentro dos limites.
function buildTemperatureAlert(coldUnit: ColdUnitLimits, temperature: number) {
  if (temperature >= coldUnit.minTemperature && temperature <= coldUnit.maxTemperature) {
    return null;
  }

  const condition = temperature < coldUnit.minTemperature ? 'ABAIXO' : 'ACIMA';

  return {
    coldUnitId: coldUnit.id,
    temperature,
    message: `ALERTA CRÍTICO: Temperatura de ${temperature}°C registrada. Limite era ${coldUnit.minTemperature}°C a ${coldUnit.maxTemperature}°C. (${condition} DO PERMITIDO)`
  };
}

class CreateTemperatureReadingService {
  async execute({ coldUnitId, deviceId, temperature, sourceType = 'REALTIME', timestamp }: TelemetryRequest) {

    // 1. Busca os limites da câmara/caminhão no banco
    const coldUnit = await prisma.coldUnit.findFirst({
      where: {
        id: coldUnitId,
        isDeleted: false
      }
    });

    if (!coldUnit) {
      throw new Error("Unidade fria não encontrada ou desativada.");
    }

    // 2. Salva a telemetria no banco de dados
    const reading = await prisma.temperatureReading.create({
      data: {
        coldUnitId,
        deviceId,
        temperature,
        sourceType,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }
    });

    // 3. Gera o alerta atrelado à unidade, se a temperatura estiver fora dos limites
    const alert = buildTemperatureAlert(coldUnit, temperature);

    if (alert) {
      await prisma.alert.create({ data: alert });

      console.log(`[ALERTA GERADO] Unidade: ${coldUnit.name} | Temp: ${temperature}°C`);
    }

    return reading;
  }
}

export { CreateTemperatureReadingService, buildTemperatureAlert };
