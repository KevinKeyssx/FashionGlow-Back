import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateBrandDto {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	slug?: string;

	@IsString()
	@IsOptional()
	logoUrl?: string;
}