import type { Request, Response } from 'express';
import { GetDashboardSummaryService } from '../../services/dashboard/GetDashboardSummaryService.js';

class GetDashboardSummaryController {
  async handle(req: Request, res: Response) {
    const getDashboardSummaryService = new GetDashboardSummaryService();

    try {
      const summary = await getDashboardSummaryService.execute(req.user.enterpriseId);
      return res.json(summary);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { GetDashboardSummaryController };
