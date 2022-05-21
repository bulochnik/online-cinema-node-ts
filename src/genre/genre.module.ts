import { TypegooseModule } from 'nestjs-typegoose';
import { Module } from '@nestjs/common';

import { MovieModule } from './../movie/movie.module';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { GenreModel } from './genre.model';

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: GenreModel,
				schemaOptions: {
					collection: 'Genre',
				},
			},
		]),
		MovieModule,
	],
	controllers: [GenreController],
	providers: [GenreService],
})
export class GenreModule {}
