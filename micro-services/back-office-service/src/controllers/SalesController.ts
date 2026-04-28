import { Request, Response } from 'express';
import { SalesService } from '../services/SalesService';

export class SalesController {
  constructor(private readonly service: SalesService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    const sales = await this.service.getAll();
    res.status(200).json({ success: true, data: sales });
  }

  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const fromRaw = this.normalizeQueryValue(req.query.from);
      const toRaw = this.normalizeQueryValue(req.query.to);

      const fromDate = fromRaw ? new Date(fromRaw) : undefined;
      const toDate = toRaw ? new Date(toRaw) : undefined;

      if (fromRaw && (!fromDate || Number.isNaN(fromDate.getTime()))) {
        res.status(400).json({ success: false, message: 'Parametre "from" invalide.' });
        return;
      }

      if (toRaw && (!toDate || Number.isNaN(toDate.getTime()))) {
        res.status(400).json({ success: false, message: 'Parametre "to" invalide.' });
        return;
      }

      if (fromDate && toDate && fromDate > toDate) {
        res.status(400).json({ success: false, message: 'La date "from" doit etre inferieure a "to".' });
        return;
      }

      const data = await this.service.getDashboardStats(fromDate, toDate);
      res.status(200).json({ success: true, data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur interne.';
      res.status(500).json({ success: false, message });
    }
  }

  private normalizeQueryValue(value: unknown): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }

    if (typeof value === 'string') {
      return value.trim() || undefined;
    }

    return undefined;
  }
}
