import { Body, Controller, Post, Get, Res, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { RegisterRequest, LoginRequest } from './auth.interfaces.js';
import type { Response, Request } from 'express';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: RegisterRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const { user, token } = await this.authService.register(body.name, body.email, body.password);
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000, 
    });
    return user;
  }

  @Post('login')
  async login(
    @Body() body: LoginRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const { user, token } = await this.authService.login(body.email, body.password);
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000, 
    });

    return user;
  }

  @Get('me')
  async me(
    @Req() req: Request,
  ) {
    const token = req.cookies.token;
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const { user } = await this.authService.me(token);
    return user;
  }

}
