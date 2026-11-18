import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, OpenAPIObject, SwaggerCustomOptions } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
	const logger: Logger = new Logger( 'Bootstrap' );
	const app: INestApplication = await NestFactory.create( AppModule );

	app.setGlobalPrefix( 'api/v1' );
	app.enableCors();
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist            : true,
			transform            : true,
			forbidNonWhitelisted : false,
		}),
	);

	const swaggerConfig: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
		.setTitle( 'FashionGlow API' )
		.setDescription( 'Documentación de la API de FashionGlow' )
		.setVersion( '1.0' )
		.build();

	const document: OpenAPIObject = SwaggerModule.createDocument( app, swaggerConfig );

	const swaggerCustomOptions: SwaggerCustomOptions = {
		useGlobalPrefix : true,
	};

	SwaggerModule.setup( 'docs', app, document, swaggerCustomOptions );

	const port: number = Number( process.env.PORT ) || 3000;
	await app.listen( port );
	logger.log( `🚀 FashionGlow Backend escuchando en http://localhost:${ port }/api/v1` );
	logger.log( `📑 Swagger disponible en http://localhost:${ port }/api/v1/docs` );
}

bootstrap().catch( ( err: unknown ): void => {
	console.error( 'Error fatal al iniciar la aplicación:', err );
	process.exit( 1 );
} );
