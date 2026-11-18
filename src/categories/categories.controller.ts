import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { CategoriesService, CategoryWithSubcategories } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@prisma/client';

@Controller( 'categories' )
export class CategoriesController {
	constructor( private readonly categoriesService: CategoriesService ) {}

	@Get()
	async findAll(): Promise<CategoryWithSubcategories[]> {
		return await this.categoriesService.findAll();
	}

	@Get( ':idOrSlug' )
	async findOne( @Param( 'idOrSlug' ) idOrSlug: string ): Promise<CategoryWithSubcategories> {
		return await this.categoriesService.findOne( idOrSlug );
	}

	@Post( 'create' )
	async create( @Body() dto: CreateCategoryDto ): Promise<Category> {
		return await this.categoriesService.create( dto );
	}

	@Post()
	async createDirect( @Body() dto: CreateCategoryDto ): Promise<Category> {
		return await this.categoriesService.create( dto );
	}

	@Patch( ':id' )
	async update(
		@Param( 'id' ) id: string,
		@Body() dto: UpdateCategoryDto,
	): Promise<Category> {
		return await this.categoriesService.update( id, dto );
	}

	@Delete( ':id' )
	async remove( @Param( 'id' ) id: string ): Promise<Category> {
		return await this.categoriesService.remove( id );
	}
}