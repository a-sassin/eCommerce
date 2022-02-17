import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import environment from 'src/environments/environment';
import { PRODUCTDATA } from '../util/constant';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class ProductsService {
    private readonly baseUrl = environment.baseUrl;

    constructor(
        private http: HttpClient,
        private readonly service: AuthService
    ) {}

    getProducts() {
        return this.http.get<any>(`${this.baseUrl}/product/details`, {
            headers: {
                Authorization: `Bearer ${this.service?.authData?.apiAccessToken}`,
            },
        });
    }

    getProduct(id: string) {
        return this.http.get<any>(`${this.baseUrl}/product/details`, {
            params: {
                productId: id,
            },
        });
    }

    getOrders(id: string) {
        return this.http.get<any>(`${this.baseUrl}/product/order-details`, {
            params: {
                orderIds: id,
            },
        });
    }

    addProduct(username: string, productId: string[]) {
        return this.http.patch<any>(`${this.baseUrl}/product/add-product`, {
            username,
            productId,
        });
    }

    removeProduct(username: string, productId: string) {
        return this.http.patch<any>(`${this.baseUrl}/product/remove-product`, {
            username,
            productId,
        });
    }

    addOrderId(username: string, orderId: string) {
        return this.http.patch<any>(`${this.baseUrl}/product/add-orderId`, {
            username,
            orderId,
        });
    }

    getProductsLocalData() {
        return JSON.parse(sessionStorage.getItem(PRODUCTDATA));
    }

    getUserProducts(username: string) {
        return this.http.get<any>(`${this.baseUrl}/product/user-products`, {
            params: {
                username,
            },
        });
    }

    getUserOrders(username: string) {
        return this.http.get<any>(`${this.baseUrl}/product/user-orders`, {
            params: {
                username,
            },
        });
    }
}
