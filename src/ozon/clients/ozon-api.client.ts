import { Injectable } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class OzonApiClient {
    async post<T>(endpoint: string, data: any, headers: Record<string, string>): Promise<T> {
        const url = `https://api-seller.ozon.ru${endpoint}`
        const res = await axios.post(url, data, { headers })
        return res.data
    }
}
