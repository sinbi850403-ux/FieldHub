import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infra/db/prisma.service";
import { BookingStatus } from "@prisma/client";
import { CreateBookingDto } from "./dto/create-booking.dto";

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(customerId: string, dto: CreateBookingDto) {
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId }, include: { category: true } });
    if (!job || !job.isActive) throw new NotFoundException("Job not found");
    if (job.categoryId !== dto.categoryId) throw new BadRequestException("Category/Job mismatch");
    if (!job.category.isActive) throw new BadRequestException("Category inactive");
    if (job.category.tier >= 3) throw new BadRequestException("Tier3 is restricted unless admin-approved");

    return this.prisma.booking.create({
      data: {
        customerId,
        categoryId: dto.categoryId,
        jobId: dto.jobId,
        status: BookingStatus.REQUESTED,
        scheduledAt: new Date(dto.scheduledAt),
        addressText: dto.addressText,
        lat: dto.lat,
        lng: dto.lng,
        priceQuoteTotal: dto.priceQuoteTotal ?? 0,
        inputs: { create: dto.inputs.map((i) => ({ fieldKey: i.fieldKey, valueText: i.valueText, valueJson: i.valueJson })) },
      },
      include: { inputs: true },
    });
  }

  async getBooking(id: string, customerId: string) {
    const b = await this.prisma.booking.findFirst({
      where: { id, customerId },
      include: { category: true, job: { include: { priceModel: true, cancellationPolicy: true, disputeProtocol: true } }, inputs: true, assignments: true, payment: true, evidences: true, dispute: true, review: true },
    });
    if (!b) throw new NotFoundException("Booking not found");
    return b;
  }

  async listCustomerBookings(customerId: string) {
    return this.prisma.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true, scheduledAt: true, priceQuoteTotal: true, createdAt: true, job: { select: { name: true } }, category: { select: { nameKo: true, tier: true } } },
    });
  }

  async cancelBooking(customerId: string, bookingId: string) {
    const b = await this.prisma.booking.findFirst({ where: { id: bookingId, customerId } });
    if (!b) throw new NotFoundException("Booking not found");
    if ([BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED_PROVIDER, BookingStatus.SIGNED_OFF, BookingStatus.SETTLED].includes(b.status)) {
      throw new BadRequestException("Cannot cancel after start");
    }
    return this.prisma.booking.update({ where: { id: bookingId }, data: { status: BookingStatus.CANCELLED } });
  }

  async signoffBooking(customerId: string, bookingId: string) {
    const b = await this.prisma.booking.findFirst({ where: { id: bookingId, customerId } });
    if (!b) throw new NotFoundException("Booking not found");
    if (b.status !== BookingStatus.COMPLETED_PROVIDER) throw new BadRequestException("Not ready for sign-off");
    return this.prisma.booking.update({ where: { id: bookingId }, data: { status: BookingStatus.SIGNED_OFF } });
  }
}
