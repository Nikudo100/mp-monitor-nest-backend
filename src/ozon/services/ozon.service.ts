import { Injectable, Logger } from '@nestjs/common'
import { AuthMethod, OzonTransaction } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserService } from 'src/user/user.service'

import { OzonApiClient } from '../clients/ozon-api.client'
import { MOCK_OZON_USER } from '../constants/ozon.mock-user'
import { CreateTransactionDto } from '../dto/create-transaction.dto'

@Injectable()
export class OzonService {
    private readonly logger = new Logger(OzonService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly ozonApiClient: OzonApiClient
    ) {}

    private async ensureMockUser(): Promise<string> {
        let user = await this.userService.findByEmail(MOCK_OZON_USER.email)
        if (!user) {
            this.logger.log('Создаю MOCK_OZON_USER...')
            user = await this.userService.create(
                MOCK_OZON_USER.email,
                MOCK_OZON_USER.password,
                MOCK_OZON_USER.name,
                '', // picture
                AuthMethod.CREDENTIALS,
                true // isVerified
            )
        }

        return user.id
    }

    public async fetchTransactions(): Promise<CreateTransactionDto[]> {
        const headers = {
            'Content-Type': 'application/json',
            'Client-Id': MOCK_OZON_USER.ozon_client_id,
            'Api-Key': MOCK_OZON_USER.ozon_api
        }

        let page = 1
        let pageCount = 1
        const allTransactions: CreateTransactionDto[] = []

        try {
            const userId = await this.ensureMockUser()

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
                        userId,
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
        } catch (error) {
            this.logger.error('[fetchTransactions] Ошибка при получении транзакций', error)
        }

        return allTransactions
    }

    public async saveTransactions(transactions: CreateTransactionDto[]): Promise<void> {
        try {
            await this.prisma.ozonTransaction.createMany({
                data: transactions,
                skipDuplicates: true
            })
        } catch (error) {
            this.logger.error('[saveTransactions] Ошибка при сохранении транзакций', error)
        }
    }

    async getAllTransactions(): Promise<OzonTransaction[]> {
        return this.prisma.ozonTransaction.findMany()
    }
}
