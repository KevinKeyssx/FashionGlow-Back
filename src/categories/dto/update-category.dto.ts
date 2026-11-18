import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCategoryDto {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	slug?: string;

	@IsString()
	@IsOptional()
	imageUrl?: string;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}