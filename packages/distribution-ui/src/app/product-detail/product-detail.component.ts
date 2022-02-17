import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import environment from 'src/environments/environment';
import { NotificationService } from '../common/Notification/notificationService';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import { ProductsService } from '../services/products.service';
import { DEFAULT_ERROR, PRODUCTDATA } from '../util/constant';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
    loading: boolean = false;

    productId: string = this.route.snapshot.queryParamMap.get('id');

    imageUrl: string;

    title: string;

    price: string;

    dressType: string;

    rewardMessage: string;

    productName: string;

    productInfo: any;

    description: string =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore';

    quantity: string = 'Quantity';

    size: string = 'Size';

    count: number = 1;

    colors: string = 'Colors';

    couponCode: string = 'Have a coupon code?';

    baseUrl = environment.baseUrl;

    constructor(
        private route: ActivatedRoute,
        private readonly service: AuthService,
        public productService: ProductsService,
        private notificationService: NotificationService,
        private readonly configService: ConfigService
    ) {}

    ngOnInit(): void {
        this.productInfo = this.configService.config['products'].find(
            product => product.productId === this.productId
        );

        this.imageUrl = `${this.baseUrl}${this.productInfo.productImageUrl}`;

        this.title = this.productInfo.productTitle;
        this.price = this.productInfo.newPrice;
        this.dressType = this.productInfo.productType;
        this.rewardMessage = `With this purchase you are going to earn ${this.price.substring(
            1,
            this.price.length
        )} reward points.`;
        this.productName = this.productInfo.productFullName;
    }

    numSequence(n: number): Array<number> {
        return Array(n);
    }

    addToCart(): any {
        this.loading = true;
        if (this.service.getUserLocalData()?.data?.accessToken) {
            const userData = this.service.getUserLocalData().data.profile
                .username;
            this.productService
                .addProduct(userData, [this.productId])
                .subscribe({
                    next: (res: any) => {
                        this.loading = false;
                        this.notificationService.addToCart();
                        this.notificationService.sendSuccess(res.message);
                    },
                    error: (err: any) => {
                        this.loading = false;
                        this.notificationService.sendError(
                            err?.error?.message || DEFAULT_ERROR
                        );
                    },
                });
        } else {
            let productIds = this.productService.getProductsLocalData()
                ?.productIds;

            if (productIds) {
                const findProduct = productIds.includes(this.productId);
                if (findProduct) {
                    this.loading = false;
                    this.notificationService.sendError(
                        'Product already added to cart'
                    );
                } else if (productIds.length >= 1) {
                    this.notificationService.sendError(
                        'Cannot add more than one product into cart'
                    );
                } else {
                    productIds.push(this.productId);
                    this.notificationService.sendSuccess(
                        'Product added to cart successfully'
                    );
                }
            } else {
                productIds = [this.productId];
                this.notificationService.sendSuccess(
                    'Product added to cart successfully'
                );
            }

            sessionStorage.setItem(PRODUCTDATA, JSON.stringify({ productIds }));
            this.notificationService.addToCart();

            this.loading = false;
        }
    }
}
