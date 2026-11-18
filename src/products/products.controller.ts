import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { ProductsService, ProductWithRelations, FacetedResponse } from './products.service';
import { FilterProductsDto } from './dto/filter-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '@prisma/client';

@Controller( 'products' )
export class ProductsController {
	constructor( private readonly productsService: ProductsService ) {}

	@Get()
	async findAll( @Query() filters: FilterProductsDto ): Promise<FacetedResponse> {
		return await this.productsService.findAll( filters );
	}

	@Get( 'featured' )
	async findFeatured(): Promise<ProductWithRelations[]> {
		return await this.productsService.findFeatured();
	}

	@Get( 'offers' )
	async findOffers(): Promise<ProductWithRelations[]> {
		return await this.productsService.findOffers();
	}

	@Get( ':idOrSlug' )
	async findOne( @Param( 'idOrSlug' ) idOrSlug: string ): Promise<ProductWithRelations> {
		return await this.productsService.findBySlug( idOrSlug );
	}

	@Post( 'create' )
	async create( @Body() dto: CreateProductDto ): Promise<Product> {
		return await this.productsService.create( dto );
	}

	@Post()
	async createDirect( @Body() dto: CreateProductDto ): Promise<Product> {
		return await this.productsService.create( dto );
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id: string,
		@Body() dto: UpdateProductDto,
	): Promise<Product> {
		return await this.productsService.update( id, dto );
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id: string ): Promise<Product> {
		return await this.productsService.remove( id );
	}
}
