export class CreateTransactionDto {
    userId: string
    operationId: bigint
    operationDate: Date | null
    operationType: string
    operationTypeName: string
    type: string
    postingNumber: string
    deliverySchema: string | null
    orderDate: Date | null
    warehouseId: bigint
    accrualsForSale: number
    amount: number
    deliveryCharge: number
    returnDeliveryCharge: number
    saleCommission: number
    items: any | null
    services: any | null
}
