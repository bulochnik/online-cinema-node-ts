import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtStrategy } from './strategies/jwt.strategy';
import { getJWTConfig } from '../config/jwt.config';
import { TypegooseModule } from 'nestjs-typegoose';
import { AuthController } from './auth.controller';
import { UserModel } from './../user/user.model';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: UserModel,
        schemaOptions: {
          collection: 'User',
        },
      },
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJWTConfig,
    }),
  ],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}