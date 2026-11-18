import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from '@prisma/client';

@Controller( 'brands' )
export class BrandsController {
	constructor( private readonly brandsService: BrandsService ) {}

	@Get()
	async findAll(): Promise<Brand[]> {
		return await this.brandsService.findAll();
	}

	@Get( ':idOrSlug' )
	async findOne( @Param( 'idOrSlug' ) idOrSlug: string ): Promise<Brand> {
		return await this.brandsService.findOne( idOrSlug );
	}

	@Post( 'create' )
	async create( @Body() dto: CreateBrandDto ): Promise<Brand> {
		return await this.brandsService.create( dto );
	}

	@Post()
	async createDirect( @Body() dto: CreateBrandDto ): Promise<Brand> {
		return await this.brandsService.create( dto );
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id: string,
		@Body() dto: UpdateBrandDto,
	): Promise<Brand> {
		return await this.brandsService.update( id, dto );
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id: string ): Promise<Brand> {
		return await this.brandsService.remove( id );
	}
}
