import { prisma } from '../../lib/prisma.js'; 
import { ReadingSourceType } from '@prisma/client';

interface TelemetryRequest {
  coldUnitId: string;
  temperature: number;
  sourceType?: ReadingSourceType; // REALTIME ou HISTORICAL (Store & Forward)
  timestamp?: Date;
}

class CreateTemperatureReadingService {
  async execute({ coldUnitId, temperature, sourceType = 'REALTIME', timestamp }: TelemetryRequest) {
    
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
        temperature,
        sourceType,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }
    });

    // 3. REGRA DE NEGÓCIO: Verificação de Quebra da Cadeia de Frio
    if (temperature < coldUnit.minTemperature || temperature > coldUnit.maxTemperature) {
      const condition = temperature < coldUnit.minTemperature ? 'ABAIXO' : 'ACIMA';
      const message = `ALERTA CRÍTICO: Temperatura de ${temperature}°C registrada. Limite era ${coldUnit.minTemperature}°C a ${coldUnit.maxTemperature}°C. (${condition} DO PERMITIDO)`;

      // Gera o alerta atrelado à unidade
      await prisma.alert.create({
        data: {
          coldUnitId,
          temperature,
          message
        }
      });
      
      console.log(`[ALERTA GERADO] Unidade: ${coldUnit.name} | Temp: ${temperature}°C`);
    }

    return reading;
  }
}

export { CreateTemperatureReadingService };