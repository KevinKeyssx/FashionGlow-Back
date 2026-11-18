import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { SeedModule } from './seed/seed.module';

@Module({
	imports		: [
		ConfigModule.forRoot({
			isGlobal	: true,
		}),
		PrismaModule,
		CategoriesModule,
		BrandsModule,
		ProductsModule,
		SeedModule,
	],
	controllers	: [],
	providers	: [],
})
export class AppModule {}
