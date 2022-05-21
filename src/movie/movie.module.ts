import { MovieController } from './movie.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { MovieService } from './movie.service';
import { Module } from '@nestjs/common';

import { MovieModel } from './movie.model';

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: MovieModel,
				schemaOptions: {
					collection: 'Movie',
				},
			},
		]),
	],
	controllers: [MovieController],
	providers: [MovieService],
})
export class MovieModule {}
