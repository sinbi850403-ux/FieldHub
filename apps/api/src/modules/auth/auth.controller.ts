import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("/auth/signup")
  signup(@Body() body: any) {
    return this.auth.signup({
      role: body.role,
      phone: body.phone,
      email: body.email,
      password: body.password,
      name: body.name,
    });
  }

  @Public()
  @Post("/auth/login")
  login(@Body() body: any) {
    return this.auth.login({ phoneOrEmail: body.phoneOrEmail, password: body.password });
  }

  @Get("/me")
  me(@Req() req: any) {
    return this.auth.me(req.user.sub);
  }
}
