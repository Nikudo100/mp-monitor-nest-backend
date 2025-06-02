import { Module } from '@nestjs/common'

import { OzonApiClient } from './clients/ozon-api.client'
import { OzonController } from './controllers/ozon.controller'
import { OzonCronService } from './services/ozon-cron.service'
import { OzonService } from './services/ozon.service'

@Module({
    controllers: [OzonController],
    providers: [OzonService, OzonApiClient, OzonCronService]
})
export class OzonModule {}
