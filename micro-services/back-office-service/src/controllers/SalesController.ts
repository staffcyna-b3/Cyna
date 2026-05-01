import { Request, Response } from 'express';
import { ISalesService } from '../services/ISalesService';

export class SalesController {
  constructor(private readonly service: ISalesService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    const sales = await this.service.getAll();
    res.status(200).json({ success: true, data: sales });
  }

  async getDashboardStats(req: Request, res: Response): Promise<void> {
    const fromRaw = this.normalizeQueryValue(req.query.from);
    const toRaw = this.normalizeQueryValue(req.query.to);

    const fromDate = fromRaw ? new Date(fromRaw) : undefined;
    const toDate = toRaw ? new Date(toRaw) : undefined;

    const data = await this.service.getDashboardStats(fromDate, toDate);
    res.status(200).json({ success: true, data });
  }

  // Normalise les query params Express qui peuvent être string | string[] | ParsedQs
  private normalizeQueryValue(value: unknown): string | undefined {
    if (Array.isArray(value)) {
      return typeof value[0] === 'string' ? value[0].trim() || undefined : undefined;
    }
    if (typeof value === 'string') {
      return value.trim() || undefined;
    }
    return undefined;
  }
}
