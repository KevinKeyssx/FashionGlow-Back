import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category, Subcategory } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export type CategoryWithSubcategories = Category & {
	subcategories: Subcategory[];
};

@Injectable()
export class CategoriesService {

    constructor(
        private readonly prisma: PrismaService
    ) {}


    async findAll(): Promise<CategoryWithSubcategories[]> {
		return await this.prisma.category.findMany({
			where   : { isActive: true },
			include : {
				subcategories : {
					where   : { isActive: true },
					orderBy : { name: 'asc' },
				},
			},
			orderBy : { name: 'asc' },
		});
	}

	async findOne( idOrSlug: string ): Promise<CategoryWithSubcategories> {
		const category = await this.prisma.category.findFirst({
			where   : {
				OR : [
					{ id: idOrSlug },
					{ slug: idOrSlug },
				],
			},
			include : {
				subcategories : {
					orderBy : { name: 'asc' },
				},
			},
		});

		if ( !category ) {
			throw new NotFoundException( `Categoría con identificador '${ idOrSlug }' no encontrada` );
		}

		return category;
	}

	async create( dto: CreateCategoryDto ): Promise<Category> {
		return await this.prisma.category.create({
			data : dto,
		});
	}

	async update( id: string, dto: UpdateCategoryDto ): Promise<Category> {
		await this.findOne( id );
		return await this.prisma.category.update({
			where : { id },
			data  : dto,
		});
	}

	async remove( id: string ): Promise<Category> {
		await this.findOne( id );
		return await this.prisma.category.delete({
			where : { id },
		});
	}
}