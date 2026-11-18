import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MOCK_BRANDS } from './data/brands';
import { MOCK_CATEGORIES, MOCK_SUBCATEGORIES } from './data/categories';
import { MOCK_ATTRIBUTE_DEFS, MOCK_ATTRIBUTE_OPTIONS } from './data/attributes';
import { MOCK_PRODUCTS } from './data/products';
import { MOCK_VARIANTS } from './data/variants';
import { MOCK_IMAGES } from './data/images';
import { MOCK_PRODUCT_ATTRIBUTES } from './data/product-attributes';

export interface SeedResult {
	success		: boolean;
	message		: string;
	timestamp	: string;
	details?	: {
		brands				: number;
		categories			: number;
		subcategories		: number;
		attributeDefinitions: number;
		attributeOptions	: number;
		products			: number;
		variants			: number;
		images				: number;
		productAttributes	: number;
	};
}

@Injectable()
export class SeedService {
	private readonly logger = new Logger( SeedService.name );

	constructor( private readonly prisma: PrismaService ) {}

	async clear(): Promise<SeedResult> {
		this.logger.log( 'Iniciando limpieza de la base de datos...' );

		await this.prisma.productAttribute.deleteMany();
		await this.prisma.productImage.deleteMany();
		await this.prisma.productVariant.deleteMany();
		await this.prisma.product.deleteMany();
		await this.prisma.attributeOption.deleteMany();
		await this.prisma.attributeDefinition.deleteMany();
		await this.prisma.subcategory.deleteMany();
		await this.prisma.category.deleteMany();
		await this.prisma.brand.deleteMany();

		this.logger.log( 'Limpieza completada con éxito.' );

		return {
			success		: true,
			message		: 'Base de datos vaciada con éxito',
			timestamp	: new Date().toISOString(),
		};
	}

	async populate(): Promise<SeedResult> {
		this.logger.log( 'Iniciando carga de datos de seed...' );

		await this.clear();

		const brands = await this.prisma.brand.createMany({
			data : MOCK_BRANDS,
		});

		const categories = await this.prisma.category.createMany({
			data : MOCK_CATEGORIES,
		});

		const subcategories = await this.prisma.subcategory.createMany({
			data : MOCK_SUBCATEGORIES,
		});

		const attributeDefs = await this.prisma.attributeDefinition.createMany({
			data : MOCK_ATTRIBUTE_DEFS,
		});

		const attributeOpts = await this.prisma.attributeOption.createMany({
			data : MOCK_ATTRIBUTE_OPTIONS,
		});

		const mappedProducts = MOCK_PRODUCTS.map( ( p ) => ({
			...p,
			createdAt : new Date( p.createdAt ),
		}) );

		const products = await this.prisma.product.createMany({
			data : mappedProducts,
		});

		const variants = await this.prisma.productVariant.createMany({
			data : MOCK_VARIANTS,
		});

		const images = await this.prisma.productImage.createMany({
			data : MOCK_IMAGES,
		});

		const productAttrs = await this.prisma.productAttribute.createMany({
			data : MOCK_PRODUCT_ATTRIBUTES,
		});

		this.logger.log( `Carga completada: ${ products.count } productos, ${ variants.count } variantes.` );

		return {
			success		: true,
			message		: 'Datos de prueba insertados con éxito',
			timestamp	: new Date().toISOString(),
			details		: {
				brands					: brands.count,
				categories				: categories.count,
				subcategories			: subcategories.count,
				attributeDefinitions	: attributeDefs.count,
				attributeOptions		: attributeOpts.count,
				products				: products.count,
				variants				: variants.count,
				images					: images.count,
				productAttributes		: productAttrs.count,
			},
		};
	}

	async reset(): Promise<SeedResult> {
		this.logger.log( 'Ejecutando reinicio completo de base de datos (clear -> populate)...' );
		await this.clear();
		return await this.populate();
	}
}