import {
	Controller,
	Post,
	Get,
	UsePipes,
	ValidationPipe,
	HttpCode,
	Param,
	Body,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { IdValidationPipe } from './../pipes/id.validation.pipe';
import { User } from './../user/decorators/user.decorator';
import { Auth } from './../auth/decorators/auth.decorator';
import { setRatingDto } from './dto/set-rating.dto';
import { RatingService } from './rating.service';

@Controller('ratings')
export class RatingController {
	constructor(private readonly ratingService: RatingService) {}

	@Get(':movieId')
	@Auth()
	async getMovieValueByUser(
		@Param('movieId', IdValidationPipe) movieId: Types.ObjectId,
		@User('_id') _id: Types.ObjectId,
	) {
		return this.ratingService.getMovieValueByUser(movieId, _id);
	}

	@UsePipes(new ValidationPipe())
	@Post('set-rating')
	@HttpCode(200)
	@Auth()
	async setRating(@User('_id') _id: Types.ObjectId, @Body() dto: setRatingDto) {
		console.log('first', _id);
		console.log('second', _id.toString());
		return this.ratingService.setRating(_id, dto);
	}
}
