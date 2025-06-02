import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { OzonService } from './ozon.service'

@Injectable()
export class OzonCronService {
    constructor(private readonly ozonService: OzonService) {}

    @Cron('* * * * *') // каждый день в полночь
    async handleCron() {
        const data = await this.ozonService.fetchTransactions()
        await this.ozonService.saveTransactions(data)
        console.log(`🕒 Cron: синхронизировано ${data.length} транзакций`)
    }
}
