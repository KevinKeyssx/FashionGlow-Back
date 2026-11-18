import { IsString, IsNotEmpty, IsUrl, IsOptional, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	slug: string;

	@IsString()
	@IsNotEmpty()
	imageUrl: string;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}