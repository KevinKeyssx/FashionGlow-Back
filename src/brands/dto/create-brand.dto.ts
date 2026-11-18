import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateBrandDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	slug: string;

	@IsString()
	@IsNotEmpty()
	logoUrl: string;
}