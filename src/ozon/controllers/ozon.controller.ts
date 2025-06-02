import { Controller, Get } from '@nestjs/common'

import { OzonService } from '../services/ozon.service'

@Controller('ozon')
export class OzonController {
    constructor(private readonly ozonService: OzonService) {}

    @Get('sync')
    async syncOzonTransactions() {
        const transactions = await this.ozonService.fetchTransactions()
        await this.ozonService.saveTransactions(transactions)
        return { message: 'Транзакции успешно загружены', count: transactions.length }
    }

    @Get('transactions')
    async getTransactions() {
        const transactions = await this.ozonService.getAllTransactions()
        return transactions
    }

    @Get('test')
    async test() {
        return { message: 'TEST' }
    }
}
