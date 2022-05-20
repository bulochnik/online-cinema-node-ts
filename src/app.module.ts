import { TypegooseModule } from 'nestjs-typegoose';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { getMongoDbConfig } from './config/mongo.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GenreModule } from './genre/genre.module';
import { FileModule } from './file/file.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypegooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoDbConfig,
		}),
		AuthModule,
		UserModule,
		GenreModule,
		FileModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
