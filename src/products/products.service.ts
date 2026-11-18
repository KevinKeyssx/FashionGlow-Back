import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, ProductVariant, ProductImage, Brand, Subcategory, Category, AttributeDefinition, AttributeOption, Gender } from '@prisma/client';
import { FilterProductsDto } from './dto/filter-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface ProductAttributeWithDetails {
	definition	: AttributeDefinition;
	option		: AttributeOption;
}

export interface ProductWithRelations extends Product {
	brand		: Brand;
	subcategory	: Subcategory;
	category	: Category;
	variants	: ProductVariant[];
	images		: ProductImage[];
	attributes	: ProductAttributeWithDetails[];
}

export interface FacetCount {
	value	: string;
	label	: string;
	count	: number;
}

export interface ColorFacet extends FacetCount {
	hex	: string;
}

export interface FacetedResponse {
	products	: ProductWithRelations[];
	totalCount	: number;
	totalPages	: number;
	facets		: {
		categories		: FacetCount[];
		subcategories	: FacetCount[];
		genders			: FacetCount[];
		brands			: FacetCount[];
		colors			: ColorFacet[];
		sizes			: FacetCount[];
		priceRange		: { min: number; max: number };
		attributes		: Record<string, FacetCount[]>;
	};
}

@Injectable()
export class ProductsService {
	constructor( private readonly prisma: PrismaService ) {}

	private mapProductToHydrated( p: any ): ProductWithRelations {
		return {
			...p,
			category	: p.subcategory?.category,
			attributes	: ( p.attributes || [] ).map( ( a: any ) => ({
				definition	: a.option?.definition,
				option		: a.option,
			}) ),
		};
	}

	private getEffectivePrice( product: { basePrice: number; discountPrice: number | null } ): number {
		return product.discountPrice ?? product.basePrice;
	}

	async findAll( filters: FilterProductsDto ): Promise<FacetedResponse> {
		const rawProducts = await this.prisma.product.findMany({
			where	: { isActive: true },
			include	: {
				brand		: true,
				subcategory	: {
					include	: { category: true },
				},
				variants	: {
					orderBy	: { sizeOrder: 'asc' },
				},
				images		: {
					orderBy	: { position: 'asc' },
				},
				attributes	: {
					include	: {
						option	: {
							include	: { definition: true },
						},
					},
				},
			},
		});

		let products = rawProducts.map( ( p ) => this.mapProductToHydrated( p ) );

		if ( filters.query ) {
			const q = filters.query.toLowerCase().trim();
			products = products.filter( ( p ) => {
				const inName = p.name.toLowerCase().includes( q );
				const inDesc = p.description.toLowerCase().includes( q );
				const inBrand = p.brand?.name.toLowerCase().includes( q );
				const inCat = p.category?.name.toLowerCase().includes( q );
				const inSubcat = p.subcategory?.name.toLowerCase().includes( q );
				const inKeywords = ( p.searchKeywords || [] ).some( ( k ) => k.toLowerCase().includes( q ) );
				return inName || inDesc || inBrand || inCat || inSubcat || inKeywords;
			} );
		}

		if ( filters.categorySlug ) {
			products = products.filter( ( p ) => p.category?.slug === filters.categorySlug );
		}

		if ( filters.subcategorySlug ) {
			products = products.filter( ( p ) => p.subcategory?.slug === filters.subcategorySlug );
		}

		if ( filters.genders && filters.genders.length > 0 ) {
			products = products.filter( ( p ) => filters.genders!.includes( p.gender ) );
		}

		if ( filters.brandSlugs && filters.brandSlugs.length > 0 ) {
			products = products.filter( ( p ) => filters.brandSlugs!.includes( p.brand?.slug ) );
		}

		if ( filters.colorFamilies && filters.colorFamilies.length > 0 ) {
			products = products.filter( ( p ) =>
				p.variants.some( ( v ) => filters.colorFamilies!.includes( v.colorFamily ) ),
			);
		}

		if ( filters.sizes && filters.sizes.length > 0 ) {
			products = products.filter( ( p ) =>
				p.variants.some( ( v ) => filters.sizes!.includes( v.size ) && v.stock > 0 ),
			);
		}

		if ( filters.priceMin !== undefined && filters.priceMin !== null ) {
			products = products.filter( ( p ) => this.getEffectivePrice( p ) >= filters.priceMin! );
		}

		if ( filters.priceMax !== undefined && filters.priceMax !== null ) {
			products = products.filter( ( p ) => this.getEffectivePrice( p ) <= filters.priceMax! );
		}

		if ( filters.attributes && Object.keys( filters.attributes ).length > 0 ) {
			for ( const [ slug, values ] of Object.entries( filters.attributes ) ) {
				if ( !values || values.length === 0 ) continue;
				products = products.filter( ( p ) =>
					p.attributes.some(
						( a ) => a.definition?.slug === slug && values.includes( a.option?.filterSlug ),
					),
				);
			}
		}

		if ( filters.onlyOnSale ) {
			products = products.filter( ( p ) => p.discountPrice !== null );
		}

		if ( filters.onlyInStock ) {
			products = products.filter( ( p ) => p.variants.some( ( v ) => v.stock > 0 ) );
		}

		products = [ ...products ].sort( ( a, b ) => {
			switch ( filters.sort ) {
				case 'precio-asc'	: return this.getEffectivePrice( a ) - this.getEffectivePrice( b );
				case 'precio-desc'	: return this.getEffectivePrice( b ) - this.getEffectivePrice( a );
				case 'nombre-asc'	: return a.name.localeCompare( b.name, 'es' );
				case 'nombre-desc'	: return b.name.localeCompare( a.name, 'es' );
				case 'recientes'	: return new Date( b.createdAt ).getTime() - new Date( a.createdAt ).getTime();
				default				: return ( b.isFeatured ? 1 : 0 ) - ( a.isFeatured ? 1 : 0 );
			}
		} );

		const allPrices = products.map( ( p ) => this.getEffectivePrice( p ) );

		const facets = {
			categories		: this.buildCategoryFacets( products ),
			subcategories	: this.buildSubcategoryFacets( products ),
			genders			: this.buildGenderFacets( products ),
			brands			: this.buildBrandFacets( products ),
			colors			: this.buildColorFacets( products ),
			sizes			: this.buildSizeFacets( products ),
			priceRange		: {
				min	: allPrices.length > 0 ? Math.min( ...allPrices ) : 0,
				max	: allPrices.length > 0 ? Math.max( ...allPrices ) : 150000,
			},
			attributes		: this.buildAttributeFacets( products ),
		};

		const totalCount = products.length;
		const pageSize = filters.pageSize || 24;
		const page = filters.page || 1;
		const totalPages = Math.max( 1, Math.ceil( totalCount / pageSize ) );
		const start = ( page - 1 ) * pageSize;
		const paged = products.slice( start, start + pageSize );

		return {
			products	: paged,
			totalCount,
			totalPages,
			facets,
		};
	}

	async findBySlug( slug: string ): Promise<ProductWithRelations> {
		const rawProduct = await this.prisma.product.findFirst({
			where	: {
				OR	: [
					{ slug },
					{ id: slug },
				],
			},
			include	: {
				brand		: true,
				subcategory	: {
					include	: { category: true },
				},
				variants	: {
					orderBy	: { sizeOrder: 'asc' },
				},
				images		: {
					orderBy	: { position: 'asc' },
				},
				attributes	: {
					include	: {
						option	: {
							include	: { definition: true },
						},
					},
				},
			},
		});

		if ( !rawProduct ) {
			throw new NotFoundException( `Producto '${ slug }' no encontrado` );
		}

		return this.mapProductToHydrated( rawProduct );
	}

	async findFeatured( limit = 8 ): Promise<ProductWithRelations[]> {
		const rawProducts = await this.prisma.product.findMany({
			where	: {
				isFeatured	: true,
				isActive	: true,
			},
			take	: limit,
			include	: {
				brand		: true,
				subcategory	: {
					include	: { category: true },
				},
				variants	: {
					orderBy	: { sizeOrder: 'asc' },
				},
				images		: {
					orderBy	: { position: 'asc' },
				},
				attributes	: {
					include	: {
						option	: {
							include	: { definition: true },
						},
					},
				},
			},
		});

		return rawProducts.map( ( p ) => this.mapProductToHydrated( p ) );
	}

	async findOffers( limit = 8 ): Promise<ProductWithRelations[]> {
		const rawProducts = await this.prisma.product.findMany({
			where	: {
				discountPrice	: { not: null },
				isActive		: true,
			},
			take	: limit,
			include	: {
				brand		: true,
				subcategory	: {
					include	: { category: true },
				},
				variants	: {
					orderBy	: { sizeOrder: 'asc' },
				},
				images		: {
					orderBy	: { position: 'asc' },
				},
				attributes	: {
					include	: {
						option	: {
							include	: { definition: true },
						},
					},
				},
			},
		});

		return rawProducts.map( ( p ) => this.mapProductToHydrated( p ) );
	}

	async create( dto: CreateProductDto ): Promise<Product> {
		return await this.prisma.product.create({
			data	: dto,
		});
	}

	async update( id: string, dto: UpdateProductDto ): Promise<Product> {
		await this.findBySlug( id );
		return await this.prisma.product.update({
			where	: { id },
			data	: dto,
		});
	}

	async remove( id: string ): Promise<Product> {
		await this.findBySlug( id );
		return await this.prisma.product.delete({
			where	: { id },
		});
	}

	private buildCategoryFacets( products: ProductWithRelations[] ): FacetCount[] {
		const map = new Map<string, FacetCount>();
		for ( const p of products ) {
			if ( !p.category ) continue;
			const { slug, name } = p.category;
			if ( map.has( slug ) ) {
				map.get( slug )!.count++;
			} else {
				map.set( slug, { value: slug, label: name, count: 1 } );
			}
		}
		return Array.from( map.values() ).sort( ( a, b ) => b.count - a.count );
	}

	private buildSubcategoryFacets( products: ProductWithRelations[] ): FacetCount[] {
		const map = new Map<string, FacetCount>();
		for ( const p of products ) {
			if ( !p.subcategory ) continue;
			const { slug, name } = p.subcategory;
			if ( map.has( slug ) ) {
				map.get( slug )!.count++;
			} else {
				map.set( slug, { value: slug, label: name, count: 1 } );
			}
		}
		return Array.from( map.values() ).sort( ( a, b ) => b.count - a.count );
	}

	private buildGenderFacets( products: ProductWithRelations[] ): FacetCount[] {
		const labels: Record<Gender, string> = {
			HOMBRE	: 'Hombre',
			MUJER	: 'Mujer',
			UNISEX	: 'Unisex',
		};
		const map = new Map<string, FacetCount>();
		for ( const p of products ) {
			const label = labels[ p.gender ] || p.gender;
			if ( map.has( p.gender ) ) {
				map.get( p.gender )!.count++;
			} else {
				map.set( p.gender, { value: p.gender, label, count: 1 } );
			}
		}
		return Array.from( map.values() ).sort( ( a, b ) => b.count - a.count );
	}

	private buildBrandFacets( products: ProductWithRelations[] ): FacetCount[] {
		const map = new Map<string, FacetCount>();
		for ( const p of products ) {
			if ( !p.brand ) continue;
			const { slug, name } = p.brand;
			if ( map.has( slug ) ) {
				map.get( slug )!.count++;
			} else {
				map.set( slug, { value: slug, label: name, count: 1 } );
			}
		}
		return Array.from( map.values() ).sort( ( a, b ) => b.count - a.count );
	}

	private buildColorFacets( products: ProductWithRelations[] ): ColorFacet[] {
		const map = new Map<string, ColorFacet>();
		for ( const p of products ) {
			const seen = new Set<string>();
			for ( const v of p.variants ) {
				if ( seen.has( v.colorFamily ) ) continue;
				seen.add( v.colorFamily );
				if ( map.has( v.colorFamily ) ) {
					map.get( v.colorFamily )!.count++;
				} else {
					map.set( v.colorFamily, {
						value	: v.colorFamily,
						label	: v.colorName,
						hex		: v.colorHex,
						count	: 1,
					} );
				}
			}
		}
		return Array.from( map.values() ).sort( ( a, b ) => b.count - a.count );
	}

	private buildSizeFacets( products: ProductWithRelations[] ): FacetCount[] {
		const map = new Map<string, { label: string; count: number; order: number }>();
		for ( const p of products ) {
			const inStock = p.variants.filter( ( v ) => v.stock > 0 );
			const seen = new Set<string>();
			for ( const v of inStock ) {
				if ( seen.has( v.size ) ) continue;
				seen.add( v.size );
				if ( map.has( v.size ) ) {
					map.get( v.size )!.count++;
				} else {
					map.set( v.size, { label: v.size, count: 1, order: v.sizeOrder } );
				}
			}
		}
		return Array.from( map.entries() )
			.sort( ( [ , a ], [ , b ] ) => a.order - b.order )
			.map( ( [ value, { label, count } ] ) => ({ value, label, count }) );
	}

	private buildAttributeFacets( products: ProductWithRelations[] ): Record<string, FacetCount[]> {
		const result: Record<string, FacetCount[]> = {};
		for ( const p of products ) {
			for ( const { definition, option } of p.attributes ) {
				if ( !definition || !definition.isFilterable || !option ) continue;
				const slug = definition.slug;
				if ( !result[ slug ] ) result[ slug ] = [];
				const existing = result[ slug ].find( ( f ) => f.value === option.filterSlug );
				if ( existing ) {
					existing.count++;
				} else {
					result[ slug ].push({
						value	: option.filterSlug,
						label	: option.displayValue,
						count	: 1,
					});
				}
			}
		}
		return result;
	}
}
