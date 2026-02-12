import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { Roles } from "../auth/roles.decorator";
import { ProviderService } from "./provider.service";

@Controller()
@Roles("PROVIDER")
export class ProviderController {
  constructor(private readonly svc: ProviderService) {}

  @Get("/provider/bookings/available")
  available(@Req() req: any) {
    return this.svc.listAvailable(req.user.sub);
  }

  @Post("/provider/bookings/:id/accept")
  accept(@Req() req: any, @Param("id") bookingId: string) {
    return this.svc.accept(req.user.sub, bookingId);
  }

  @Post("/provider/bookings/:id/status")
  updateStatus(@Req() req: any, @Param("id") bookingId: string, @Body() body: any) {
    return this.svc.updateExecutionStatus(req.user.sub, bookingId, body.status);
  }

  @Post("/provider/bookings/:id/evidence")
  evidence(@Req() req: any, @Param("id") bookingId: string, @Body() body: any) {
    return this.svc.addEvidence(req.user.sub, bookingId, body.type, body.url, body.meta);
  }
}
