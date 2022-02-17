import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import environment from 'src/environments/environment';
import { AuthService } from '../services/auth.service';
import { ProductsService } from '../services/products.service';
import { PRODUCTDATA, TITLEURL } from '../util/constant';

@Component({
    selector: 'app-shopping-cart',
    templateUrl: './shopping-cart.component.html',
    styleUrls: ['./shopping-cart.component.scss'],
})
export class ShoppingCartComponent implements OnInit {
    productInfo: any;

    productName: string = 'Product name';

    quantity: string = 'Quantity';

    totalPrice: string = 'Total Price';

    orderSummary: string = 'Order Summary';

    actualPrice: string = 'Actual Price';

    productTax: string = 'Product Tax';

    tax: string = '$6';

    charge: string = '$0';

    shippingCharge: string = 'Shipping Charge';

    loading: boolean = false;

    totalPriceValue: string = '$57';

    proceedText: string = 'Proceed to Check out';

    continue: string = 'Continue Shopping';

    shopNow: string = 'Shop Now';

    productId: string;

    baseUrl = environment.baseUrl;

    imagePath: String = `${this.baseUrl}/assets/images/emptyCart.png`;

    constructor(
        private readonly service: AuthService,
        public productService: ProductsService,
        public router: Router
    ) {}

    accessToken = this.service.getUserLocalData()?.data?.accessToken;

    ngOnInit(): void {
        this.loading = true;
        if (this.accessToken) {
            const userInfo = this.service.getUserLocalData()?.data?.profile;
            this.productService
                .getUserProducts(userInfo.username)
                .pipe(
                    switchMap(res =>
                        this.productService.getProduct(res?.data?.[0])
                    )
                )
                .subscribe({
                    next: (response: any) => {
                        this.loading = false;
                        this.productInfo = response?.data;
                        this.totalPriceValue = `$${Number(
                            response?.data?.newPrice.substring(1)
                        ) + 6}`;
                    },
                    error: () => {
                        this.loading = false;
                    },
                });
        } else {
            const productIds = this.productService.getProductsLocalData()
                ?.productIds;
            this.productService.getProduct(productIds?.[0]).subscribe({
                next: (response: any) => {
                    this.loading = false;
                    this.productInfo = response?.data;
                    this.totalPriceValue = `$${Number(
                        response?.data.newPrice.substring(1)
                    ) + 6}`;
                },
            });
            this.loading = false;
        }
    }

    onContinue(): any {
        this.router.navigate(['/dashboard']);
    }

    onClose(): any {
        if (this.accessToken) {
            const userData = this.service.getUserLocalData().data.profile
                .username;
            this.productService
                .removeProduct(userData, this.productId)
                .subscribe();
        } else {
            const productIds = this.productService.getProductsLocalData()
                ?.productIds;

            if (productIds) {
                productIds.shift(0);
            }
            sessionStorage.setItem(PRODUCTDATA, JSON.stringify({ productIds }));
        }
    }

    checkout(): any {
        if (this.accessToken) {
            this.router.navigate(['/checkout-item']);
        } else {
            this.router.navigate(['/email-verify']);
            sessionStorage.setItem(TITLEURL, '/checkout-item');
        }
    }
}
