import { Body, Controller, Param, Post, Req } from "@nestjs/common";
import { Roles } from "../auth/roles.decorator";
import { AdminService } from "./admin.service";

@Controller()
@Roles("ADMIN")
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Post("/admin/disputes/:id/resolve")
  resolve(@Req() req: any, @Param("id") disputeId: string, @Body() body: any) {
    return this.svc.resolveDispute(req.user.sub, disputeId, body);
  }

  @Post("/admin/settlements/run")
  run(@Req() req: any, @Body() body: any) {
    return this.svc.runSettlements(req.user.sub, body);
  }
}
