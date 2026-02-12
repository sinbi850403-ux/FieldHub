import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { Roles } from "../auth/roles.decorator";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";

@Controller()
@Roles("CUSTOMER")
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post("/bookings")
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookings.createBooking(req.user.sub, dto);
  }

  @Get("/bookings/:id")
  get(@Req() req: any, @Param("id") id: string) {
    return this.bookings.getBooking(id, req.user.sub);
  }

  @Get("/bookings")
  list(@Req() req: any) {
    return this.bookings.listCustomerBookings(req.user.sub);
  }

  @Post("/bookings/:id/cancel")
  cancel(@Req() req: any, @Param("id") id: string) {
    return this.bookings.cancelBooking(req.user.sub, id);
  }

  @Post("/bookings/:id/signoff")
  signoff(@Req() req: any, @Param("id") id: string) {
    return this.bookings.signoffBooking(req.user.sub, id);
  }
}
