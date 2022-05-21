import { IsObjectId } from 'class-validator-mongo-object-id';
import { IsNumber } from 'class-validator';
import { Types } from 'mongoose';

export class setRatingDto {
	@IsObjectId({ message: 'Movie id is invalid' })
	movieId: Types.ObjectId;

	@IsNumber()
	value: number;
}
