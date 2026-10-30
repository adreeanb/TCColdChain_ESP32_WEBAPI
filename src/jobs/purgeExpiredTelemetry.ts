import { PurgeExpiredTelemetryService } from '../services/telemetry/PurgeExpiredTelemetryService.js';

const PURGE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutos

export function iniciarPurgeExpiredTelemetryJob() {
  const purgeExpiredTelemetryService = new PurgeExpiredTelemetryService();

  const run = async () => {
    try {
      const count = await purgeExpiredTelemetryService.execute();

      if (count > 0) {
        console.log(`[QUARENTENA] ${count} leitura(s) expirada(s) descartada(s).`);
      }
    } catch (error: any) {
      console.error('❌ Erro ao limpar a quarentena:', error.message);
    }
  };

  run();
  setInterval(run, PURGE_INTERVAL_MS);
}
