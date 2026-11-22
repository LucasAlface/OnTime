import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import jsonwebtoken from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET ?? (() => {
  throw new Error('JWT_SECRET is not configured');
})(); 

@Injectable()
export class AuthService {

  constructor(private prisma: PrismaService) {}


  async register(name: string, email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.db.orm.public.User
      .select('id', 'email', 'name', 'createdAt', 'updatedAt')
      .create({
        name,
        email,
        passwordHash,
      });


    const token = this.createToken(user.id);
    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.db.orm.public.User
      .where({ email })
      .first();

    if (!user) {
      throw new NotFoundException('User not found'); // HTTP 404
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password'); // HTTP 400 (ou UnauthorizedException para 401)
    }

    const token = this.createToken(user.id);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };  }

  async me(token: string) {

    const payload = this.validateToken(token);
    if (typeof payload === 'string' || typeof payload.userId !== 'number') {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.db.orm.public.User
      .where({ id: payload.userId })
      .first();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser };
  }

  private createToken(userId: number) {
    return jsonwebtoken.sign(
      { userId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  private validateToken(token: string) {
    try {
      return jsonwebtoken.verify(token, JWT_SECRET);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

}

  
