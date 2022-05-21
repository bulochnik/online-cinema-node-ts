import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { genSalt, hash } from 'bcryptjs';
import { Types } from 'mongoose';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserModel } from './user.model';

@Injectable()
export class UserService {
	constructor(
		@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>,
	) {}

	async byId(_id: string) {
		const user = await this.userModel.findById(_id);
		if (!user) throw new NotFoundException('User not found');

		return user;
	}

	async updateProfile(_id: string, dto: UpdateUserDto) {
		const user = await this.byId(_id);
		const isSameUser = await this.userModel.findOne({ email: dto.email });

		if (isSameUser && String(_id) !== String(isSameUser._id))
			throw new NotFoundException('Email busy');

		if (dto.password) {
			const salt = await genSalt(10);
			user.password = await hash(dto.password, salt);
		}

		user.email = dto.email;
		if (dto.isAdmin || dto.isAdmin === false) {
			user.isAdmin = dto.isAdmin;
		}

		await user.save();
		return user;
	}

	async getCount() {
		return this.userModel.find().count().exec();
	}

	async getAll(searchTerm?: string) {
		let options = {};

		if (searchTerm) {
			options = {
				$or: [
					{
						email: new RegExp(searchTerm, 'i'),
					},
				],
			};
		}

		return this.userModel
			.find(options)
			.select('-password -updatedAt -__v')
			.sort({
				createdAt: 'desc',
			})
			.exec();
	}

	async delete(id: string) {
		return this.userModel.findByIdAndDelete(id).exec();
	}

	async toggleFavorites(movieId: Types.ObjectId, user: UserModel) {
		const { _id, favorites } = user;

		if (favorites) {
			await this.userModel.findByIdAndUpdate(_id, {
				favorites: favorites.includes(movieId)
					? favorites.filter((id) => String(id) !== String(movieId))
					: [...favorites, movieId],
			});
		}
	}

	async getFavoritesMovies(_id: Types.ObjectId) {
		return this.userModel
			.findById(_id, 'favorites')
			.populate({
				path: 'favorites',
				populate: {
					path: 'genres',
				},
			})
			.exec()
			.then((data) => data?.favorites);
	}
}
