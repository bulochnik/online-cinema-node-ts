import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { TypegooseModule } from 'nestjs-typegoose/dist/typegoose.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModel } from './user.model';

@Module({
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
	],
	providers: [UserService],
	controllers: [UserController],
})
export class UserModule {}
