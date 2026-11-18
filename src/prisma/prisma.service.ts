import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { Pool }         from 'pg';
import { PrismaPg }     from '@prisma/adapter-pg';

import { ENVS } from '../config/envs';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger( PrismaService.name );

    constructor( ) {
		const pool    = new Pool({ connectionString : ENVS.DATABASE_URL });
		const adapter = new PrismaPg( pool );

		super({ adapter });
	}


	async onModuleInit(): Promise<void> {
		try {
			await this.$connect();
			this.logger.log( 'Conexión exitosa a PostgreSQL mediante Prisma.' );
		} catch ( error ) {
			this.logger.warn(
				'No se pudo conectar a la base de datos PostgreSQL al iniciar. Verifique que PostgreSQL esté corriendo y que DATABASE_URL en .env sea correcta.',
			);
		}
	}

	async onModuleDestroy(): Promise<void> {
		await this.$disconnect();
	}
}
