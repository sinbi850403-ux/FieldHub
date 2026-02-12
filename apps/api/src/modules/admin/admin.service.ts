import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infra/db/prisma.service";
import { BookingStatus, DisputeStatus, PaymentStatus } from "@prisma/client";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveDispute(adminUserId: string, disputeId: string, body: any) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id: disputeId }, include: { booking: true } });
    if (!dispute) throw new NotFoundException("Dispute not found");
    if (dispute.status === DisputeStatus.CLOSED) throw new BadRequestException("Already closed");

    const action = body.action as string;
    const resolution = {
      action,
      note: body.note ?? null,
      refundAmountKrw: body.refundAmountKrw ?? null,
      reworkDueAt: body.reworkDueAt ?? null,
      resolvedBy: adminUserId,
      resolvedAt: new Date().toISOString(),
    };

    let bookingStatus: BookingStatus | undefined;
    if (action === "PARTIAL_REFUND" || action === "FULL_REFUND") {
      bookingStatus = BookingStatus.REFUNDED;
      await this.prisma.payment.updateMany({ where: { bookingId: dispute.bookingId }, data: { status: PaymentStatus.REFUNDED } });
    } else if (action === "REWORK") {
      bookingStatus = BookingStatus.IN_PROGRESS;
    } else if (action === "REJECT") {
      bookingStatus = dispute.booking.status;
    } else {
      throw new BadRequestException("Invalid action");
    }

    await this.prisma.booking.update({ where: { id: dispute.bookingId }, data: { status: bookingStatus } });

    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status:
          action === "REWORK"
            ? DisputeStatus.RESOLVED_REWORK
            : action === "PARTIAL_REFUND"
              ? DisputeStatus.RESOLVED_PARTIAL_REFUND
              : action === "FULL_REFUND"
                ? DisputeStatus.RESOLVED_FULL_REFUND
                : DisputeStatus.REJECTED,
        resolution,
        resolvedAt: new Date(),
      },
    });
  }

  async runSettlements(adminUserId: string, body: any) {
    const periodStart = body?.periodStart ? new Date(body.periodStart) : new Date(Date.now() - 7 * 86400000);
    const periodEnd = body?.periodEnd ? new Date(body.periodEnd) : new Date();

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.SIGNED_OFF,
        createdAt: { gte: periodStart, lte: periodEnd },
        payment: { isNot: null },
        assignments: { some: { status: "ACCEPTED" } },
      },
      include: { payment: true, assignments: true },
    });

    const byProvider = new Map<string, number>();
    for (const b of bookings) {
      const providerId = b.assignments[0].providerId;
      const payout = Math.max(0, (b.payment?.providerPayoutAmountKrw ?? 0) || (b.payment?.amountKrw ?? 0));
      byProvider.set(providerId, (byProvider.get(providerId) ?? 0) + payout);
    }

    const created: any[] = [];
    for (const [providerId, totalPayoutKrw] of byProvider.entries()) {
      const s = await this.prisma.settlement.create({
        data: { providerId, periodStart, periodEnd, totalPayoutKrw, status: "PENDING" },
      });
      created.push(s);
    }

    await this.prisma.booking.updateMany({ where: { id: { in: bookings.map((b) => b.id) } }, data: { status: BookingStatus.SETTLED } });

    return { periodStart, periodEnd, createdCount: created.length, settlements: created };
  }
}
