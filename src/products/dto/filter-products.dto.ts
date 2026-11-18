import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FilterProductsDto {
	@IsOptional()
	@IsString()
	query?: string;

	@IsOptional()
	@IsString()
	categorySlug?: string;

	@IsOptional()
	@IsString()
	subcategorySlug?: string;

	@IsOptional()
	@Transform( ( { value } ) => {
		if ( Array.isArray( value ) ) return value;
		if ( typeof value === 'string' && value.length > 0 ) return value.split( ',' );
		return [];
	} )
	genders?: string[];

	@IsOptional()
	@Transform( ( { value } ) => {
		if ( Array.isArray( value ) ) return value;
		if ( typeof value === 'string' && value.length > 0 ) return value.split( ',' );
		return [];
	} )
	brandSlugs?: string[];

	@IsOptional()
	@Transform( ( { value } ) => {
		if ( Array.isArray( value ) ) return value;
		if ( typeof value === 'string' && value.length > 0 ) return value.split( ',' );
		return [];
	} )
	colorFamilies?: string[];

	@IsOptional()
	@Transform( ( { value } ) => {
		if ( Array.isArray( value ) ) return value;
		if ( typeof value === 'string' && value.length > 0 ) return value.split( ',' );
		return [];
	} )
	sizes?: string[];

	@IsOptional()
	@Type( () => Number )
	@IsNumber()
	priceMin?: number;

	@IsOptional()
	@Type( () => Number )
	@IsNumber()
	priceMax?: number;

	@IsOptional()
	@Transform( ( { value } ) => {
		if ( typeof value === 'string' ) {
			try {
				return JSON.parse( value );
			} catch {
				return {};
			}
		}
		return value || {};
	} )
	attributes?: Record<string, string[]>;

	@IsOptional()
	@Transform( ( { value } ) => value === 'true' || value === true )
	@IsBoolean()
	onlyOnSale?: boolean;

	@IsOptional()
	@Transform( ( { value } ) => value === 'true' || value === true )
	@IsBoolean()
	onlyInStock?: boolean;

	@IsOptional()
	@IsString()
	sort?: string;

	@IsOptional()
	@Type( () => Number )
	@IsNumber()
	page?: number = 1;

	@IsOptional()
	@Type( () => Number )
	@IsNumber()
	pageSize?: number = 24;
}
