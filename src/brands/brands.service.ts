import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Brand } from '@prisma/client';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
	constructor( private readonly prisma: PrismaService ) {}

	async findAll(): Promise<Brand[]> {
		return await this.prisma.brand.findMany({
			orderBy : { name: 'asc' },
		});
	}

	async findOne( idOrSlug: string ): Promise<Brand> {
		const brand = await this.prisma.brand.findFirst({
			where : {
				OR : [
					{ id: idOrSlug },
					{ slug: idOrSlug },
				],
			},
		});

		if ( !brand ) {
			throw new NotFoundException( `Marca con identificador '${ idOrSlug }' no encontrada` );
		}

		return brand;
	}

	async create( dto: CreateBrandDto ): Promise<Brand> {
		return await this.prisma.brand.create({
			data : dto,
		});
	}

	async update( id: string, dto: UpdateBrandDto ): Promise<Brand> {
		await this.findOne( id );
		return await this.prisma.brand.update({
			where : { id },
			data  : dto,
		});
	}

	async remove( id: string ): Promise<Brand> {
		await this.findOne( id );
		return await this.prisma.brand.delete({
			where : { id },
		});
	}
}