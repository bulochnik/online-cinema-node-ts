import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { hash, genSalt, compare } from 'bcryptjs';
import { InjectModel } from 'nestjs-typegoose';
import { JwtService } from '@nestjs/jwt';

import { RefreshTokenDto } from './dto/refresh.dto';
import { UserModel } from '../user/user.model';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>,
		private readonly jwtService: JwtService,
	) {}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto);

		const tokens = await this.issueTokenPair(String(user._id));

		return {
			user: this.returnUserFields(user),
			...tokens,
		};
	}

	async getNewTokens({ refreshToken }: RefreshTokenDto) {
		if (!refreshToken) throw new UnauthorizedException('Please sign in!');

		const result = await this.jwtService.verifyAsync(refreshToken);
		if (!result) throw new UnauthorizedException('Invalid token or expired!');

		const user = await this.userModel.findById(result._id);
		if (!user) throw new NotFoundException('User not found');

		const tokens = await this.issueTokenPair(String(user._id));

		return {
			user: this.returnUserFields(user),
			...tokens,
		};
	}

	async register(dto: AuthDto) {
		const oldUser = await this.userModel.findOne({ email: dto.email });
		if (oldUser) {
			throw new BadRequestException(
				'User with this email is alredy in the system',
			);
		}

		const salt = await genSalt(10);

		const newUser = new this.userModel({
			email: dto.email,
			password: await hash(dto.password, salt),
		});

		const tokens = await this.issueTokenPair(String(newUser._id));

		return {
			user: this.returnUserFields(newUser),
			...tokens,
		};
	}

	async validateUser(dto: AuthDto): Promise<UserModel> {
		const user = await this.userModel.findOne({ email: dto.email });
		if (!user) throw new UnauthorizedException('User not found');

		const isValidPassword = await compare(dto.password, user.password);
		if (!isValidPassword) throw new UnauthorizedException('Invalid password');

		return user;
	}

	async issueTokenPair(userId: string) {
		const data = { _id: userId };

		const refreshToken = await this.jwtService.signAsync(data, {
			expiresIn: '15d',
		});

		const accessToken = await this.jwtService.signAsync(data, {
			expiresIn: '15m',
		});
		6;

		return { refreshToken, accessToken };
	}

	returnUserFields(user: UserModel) {
		return {
			_id: user._id,
			email: user.email,
			isAdmin: user.isAdmin,
		};
	}
}
