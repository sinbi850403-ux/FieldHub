import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../infra/db/prisma.service";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async signup(params: { role: "CUSTOMER" | "PROVIDER" | "ADMIN"; phone?: string; email?: string; password: string; name?: string }) {
    if (!params.phone && !params.email) throw new BadRequestException("phone or email required");
    const passwordHash = await bcrypt.hash(params.password, 10);

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          params.phone ? { phone: params.phone } : undefined,
          params.email ? { email: params.email } : undefined,
        ].filter(Boolean) as any,
      },
    });
    if (existing) throw new BadRequestException("user already exists");

    const user = await this.prisma.user.create({
      data: {
        role: params.role,
        phone: params.phone,
        email: params.email,
        name: params.name,
        passwordHash,
      },
    });

    if (params.role === "PROVIDER") {
      await this.prisma.providerProfile.create({ data: { userId: user.id, tierAllowedMax: 2 } });
    }

    return { userId: user.id, accessToken: this.jwt.sign({ sub: user.id, role: user.role }) };
  }

  async login(params: { phoneOrEmail: string; password: string }) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ phone: params.phoneOrEmail }, { email: params.phoneOrEmail }] },
    });
    if (!user || !user.passwordHash) throw new UnauthorizedException("invalid credentials");

    const ok = await bcrypt.compare(params.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("invalid credentials");

    return { accessToken: this.jwt.sign({ sub: user.id, role: user.role }) };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, phone: true, email: true, name: true, status: true, createdAt: true },
    });
  }
}
