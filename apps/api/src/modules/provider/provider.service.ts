import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infra/db/prisma.service";
import { AssignmentStatus, BookingStatus, EvidenceType } from "@prisma/client";

@Injectable()
export class ProviderService {
  constructor(private readonly prisma: PrismaService) {}

  async listAvailable(providerUserId: string) {
    const provider = await this.prisma.providerProfile.findUnique({ where: { userId: providerUserId } });
    if (!provider) throw new BadRequestException("Provider profile missing");

    return this.prisma.booking.findMany({
      where: { status: BookingStatus.REQUESTED, category: { tier: { lte: provider.tierAllowedMax } } },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
      select: { id: true, status: true, scheduledAt: true, addressText: true, priceQuoteTotal: true, category: { select: { nameKo: true, tier: true } }, job: { select: { name: true } } },
    });
  }

  async accept(providerUserId: string, bookingId: string) {
    const provider = await this.prisma.providerProfile.findUnique({ where: { userId: providerUserId } });
    if (!provider) throw new BadRequestException("Provider profile missing");

    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { category: true } });
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.status !== BookingStatus.REQUESTED) throw new BadRequestException("Booking not available");
    if (booking.category.tier > provider.tierAllowedMax) throw new BadRequestException("Tier not allowed");

    await this.prisma.bookingAssignment.create({
      data: { bookingId, providerId: providerUserId, status: AssignmentStatus.ACCEPTED },
    });

    return this.prisma.booking.update({ where: { id: bookingId }, data: { status: BookingStatus.ASSIGNED } });
  }

  async updateExecutionStatus(providerUserId: string, bookingId: string, status: string) {
    const assign = await this.prisma.bookingAssignment.findFirst({ where: { bookingId, providerId: providerUserId, status: AssignmentStatus.ACCEPTED } });
    if (!assign) throw new BadRequestException("Not assigned");

    const map: Record<string, BookingStatus> = {
      EN_ROUTE: BookingStatus.IN_PROGRESS,
      ON_SITE: BookingStatus.IN_PROGRESS,
      WORKING: BookingStatus.IN_PROGRESS,
      DONE_REQUESTED: BookingStatus.COMPLETED_PROVIDER,
    };
    const next = map[status];
    if (!next) throw new BadRequestException("Invalid status");

    return this.prisma.booking.update({ where: { id: bookingId }, data: { status: next } });
  }

  async addEvidence(uploaderUserId: string, bookingId: string, type: EvidenceType | string, url: string, meta?: any) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException("Booking not found");
    return this.prisma.evidence.create({ data: { bookingId, uploaderUserId, type: type as any, url, meta } });
  }
}
