import { ICollection } from './genre.interface';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';

import { CreateGenreDto } from './dto/create-genre.dto';
import { MovieService } from './../movie/movie.service';
import { GenreModel } from './genre.model';

@Injectable()
export class GenreService {
	constructor(
		@InjectModel(GenreModel) private readonly genreModel: ModelType<GenreModel>,
		private readonly movieService: MovieService,
	) {}

	async bySlug(slug: string) {
		return this.genreModel.findOne({ slug }).exec();
	}

	async getAll(searchTerm?: string) {
		let options = {};

		if (searchTerm)
			options = {
				$or: [
					{
						name: new RegExp(searchTerm, 'i'),
					},
					{
						slug: new RegExp(searchTerm, 'i'),
					},
					{
						description: new RegExp(searchTerm, 'i'),
					},
				],
			};

		return this.genreModel
			.find(options)
			.select('-updatedAt -__v')
			.sort({ createdAt: 'desc' })
			.exec();
	}

	async getCollections() {
		const genres = await this.getAll();
		// const collections = genres;
		const collections = await Promise.all(
			genres.map(async (genre) => {
				const moviesByGenre = await this.movieService.byGenres([genre._id]);

				const result: ICollection = {
					_id: String(genre._id),
					image: moviesByGenre.bigPoster,
					slug: genre.slug,
					title: genre.name,
				};

				return result;
			}),
		);

		return collections;
	}

	// Admin place
	async byId(_id: string) {
		const genre = await this.genreModel.findById(_id);
		if (!genre) throw new NotFoundException('Genre not found');

		return genre;
	}

	async create() {
		const defaultValue: CreateGenreDto = {
			name: '',
			slug: '',
			description: '',
			icon: '',
		};
		const genre = await this.genreModel.create(defaultValue);

		return genre._id;
	}

	async update(_id: string, dto: CreateGenreDto) {
		const updateGenre = await this.genreModel
			.findByIdAndUpdate(_id, dto, {
				new: true,
			})
			.exec();

		if (!updateGenre) throw new NotFoundException('Genre not found');

		return updateGenre;
	}

	async delete(id: string) {
		const deleteGenre = await this.genreModel.findByIdAndDelete(id).exec();

		if (!deleteGenre) throw new NotFoundException('Genre not found');

		return deleteGenre;
	}
}
