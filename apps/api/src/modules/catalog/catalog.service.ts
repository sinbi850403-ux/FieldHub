import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infra/db/prisma.service";

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ tier: "asc" }, { nameKo: "asc" }],
      select: { id: true, categoryId: true, nameKo: true, description: true, tier: true },
    });
  }

  async getCategory(id: string) {
    const c = await this.prisma.category.findUnique({ where: { id } });
    if (!c) throw new NotFoundException("Category not found");
    return c;
  }

  async listJobs(categoryId: string) {
    return this.prisma.job.findMany({
      where: { categoryId, isActive: true },
      orderBy: { jobId: "asc" },
      select: {
        id: true, jobId: true, name: true, baseDurationMin: true,
        priceModel: { select: { type: true, minPriceKrw: true, maxPriceKrw: true, unitMinutes: true, minBillableUnits: true, quoteSlaMin: true, milestones: true } },
        cancellationPolicy: { select: { policyId: true, freeCancelBeforeMin: true, lateCancelFeeRate: true, afterStartFeeRate: true } },
        disputeProtocol: { select: { protocolId: true, timeLimitHours: true, evidenceRequired: true, customerAckRequired: true } },
      },
    });
  }

  async listInputFields(categoryId: string) {
    return this.prisma.inputField.findMany({
      where: { categoryId },
      orderBy: { fieldKey: "asc" },
      select: { fieldKey: true, label: true, type: true, required: true, options: true },
    });
  }
}
