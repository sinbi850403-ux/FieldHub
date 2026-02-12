import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./infra/db/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { JwtAuthGuard } from "./modules/auth/auth.guard";
import { RolesGuard } from "./modules/auth/roles.guard";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { ProviderModule } from "./modules/provider/provider.module";
import { AdminModule } from "./modules/admin/admin.module";

@Module({
  imports: [PrismaModule, HealthModule, AuthModule, CatalogModule, BookingsModule, ProviderModule, AdminModule],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
