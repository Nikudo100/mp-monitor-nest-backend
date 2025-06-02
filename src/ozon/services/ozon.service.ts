import { Injectable } from '@nestjs/common'
import { OzonTransaction } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import { OzonApiClient } from '../clients/ozon-api.client'
import { MOCK_OZON_USER } from '../constants/ozon.mock-user'
import { CreateTransactionDto } from '../dto/create-transaction.dto'

@Injectable()
export class OzonService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly ozonApiClient: OzonApiClient
    ) {}

    async fetchTransactions(): Promise<CreateTransactionDto[]> {
        // логика только получения
        const headers = {
            'Content-Type': 'application/json',
            'Client-Id': MOCK_OZON_USER.ozon_client_id,
            'Api-Key': MOCK_OZON_USER.ozon_api
        }

        let page = 1
        let pageCount = 1
        const allTransactions: CreateTransactionDto[] = []

        do {
            const body = {
                filter: {
                    date: {
                        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
                        to: new Date().toISOString()
                    },
                    operation_type: [],
                    posting_number: '',
                    transaction_type: 'all'
                },
                page,
                page_size: 1000
            }

            const res = await this.ozonApiClient.post<any>('/v3/finance/transaction/list', body, headers)

            const operations = res?.result?.operations ?? []
            pageCount = res?.result?.page_count ?? 1

            operations.forEach(op => {
                const dto: CreateTransactionDto = {
                    userId: MOCK_OZON_USER.id.toString(),
                    operationId: BigInt(op.operation_id),
                    operationDate: undefined,
                    operationType: '',
                    operationTypeName: '',
                    type: '',
                    postingNumber: '',
                    deliverySchema: '',
                    orderDate: undefined,
                    warehouseId: 0n,
                    accrualsForSale: 0,
                    amount: 0,
                    deliveryCharge: 0,
                    returnDeliveryCharge: 0,
                    saleCommission: 0,
                    items: undefined,
                    services: undefined
                }
                allTransactions.push(dto)
            })

            page++
        } while (page <= pageCount)

        return allTransactions
    }

    async saveTransactions(transactions: CreateTransactionDto[]): Promise<void> {
        await this.prisma.ozonTransaction.createMany({
            data: transactions,
            skipDuplicates: true
        })
    }

    async getAllTransactions(): Promise<OzonTransaction[]> {
        return this.prisma.ozonTransaction.findMany()
    }
}
