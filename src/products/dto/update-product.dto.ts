import { IsString, IsEnum, IsInt, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateProductDto {
	@IsOptional()
	@IsString()
	subcategoryId?: string;

	@IsOptional()
	@IsString()
	brandId?: string;

	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	slug?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsEnum( Gender )
	gender?: Gender;

	@IsOptional()
	@IsInt()
	basePrice?: number;

	@IsOptional()
	@IsInt()
	discountPrice?: number;

	@IsOptional()
	@IsInt()
	minEffectivePrice?: number;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	searchKeywords?: string[];

	@IsOptional()
	@IsBoolean()
	isFeatured?: boolean;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
