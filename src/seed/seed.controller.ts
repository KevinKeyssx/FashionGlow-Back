import { Controller, Post, Delete, Get } from '@nestjs/common';
import { SeedService, SeedResult } from './seed.service';

@Controller( 'seed' )
export class SeedController {
	constructor( private readonly seedService: SeedService ) {}

    @Get()
    async hello() {
        return 'hola';
    }

	@Post( 'populate' )
	async populate(): Promise<SeedResult> {
		return await this.seedService.populate();
	}

	@Delete( 'clear' )
	async clear(): Promise<SeedResult> {
		return await this.seedService.clear();
	}

	@Post( 'clear' )
	async clearPost(): Promise<SeedResult> {
		return await this.seedService.clear();
	}

	@Post( 'reset' )
	async reset(): Promise<SeedResult> {
		return await this.seedService.reset();
	}
}