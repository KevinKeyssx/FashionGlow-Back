import { IsString, IsNotEmpty, IsEnum, IsInt, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateProductDto {
	@IsString()
	@IsNotEmpty()
	subcategoryId: string;

	@IsString()
	@IsNotEmpty()
	brandId: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	slug: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsEnum( Gender )
	gender: Gender;

	@IsInt()
	basePrice: number;

	@IsOptional()
	@IsInt()
	discountPrice?: number;

	@IsInt()
	minEffectivePrice: number;

	@IsArray()
	@IsString({ each: true })
	searchKeywords: string[];

	@IsOptional()
	@IsBoolean()
	isFeatured?: boolean;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
