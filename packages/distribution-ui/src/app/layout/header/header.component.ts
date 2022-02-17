import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import {
    HeaderBtnProp,
    LogoAndTitle,
    MenuItem,
} from 'src/app/models/header.model';
import { UserLocalData } from 'src/app/models/user-detail.model';
import { DEFAULT_ERROR, PRODUCTDATA } from 'src/app/util/constant';
import { ConfigService } from 'src/app/services/config.service';
import environment from 'src/environments/environment';
import { ProductsService } from 'src/app/services/products.service';
import {
    ECartNotificationType,
    NotificationService,
} from 'src/app/common/Notification/notificationService';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
    constructor(
        public router: Router,
        private configService: ConfigService,
        public productService: ProductsService,
        private notificationService: NotificationService,
        private readonly service: AuthService
    ) {}

    loading: boolean = false;

    cartCount: number = 0;

    userData: UserLocalData = {
        name: 'User',
        email: '',
        userId: '',
        isLoggedIn: false,
    };

    options: HeaderBtnProp[] = [
        {
            key: 'shoppingCart',
            text: '',
            icon: 'shopping_cart',
            redirUrl: '/shopping-cart',
            id: 'shoppingCart',
        },
        {
            key: 'login',
            text: 'Login',
            id: 'login',
            click: true,
        },
        {
            key: 'signup',
            text: 'Sign Up',
            id: 'login',
            redirUrl: '/signup',
        },
    ];

    optionsAfterLogin: HeaderBtnProp[] = [
        {
            key: 'accountCircle',
            icon: 'account_circle',
        },
        {
            key: 'shoppingCart',
            icon: 'shopping_cart',
            redirUrl: '/shopping-cart',
        },
    ];

    dropDowns: HeaderBtnProp[] = [
        {
            key: 'mens',
            text: 'Mens',
            redirUrl: '/',
            id: 'mens',
        },
        {
            key: 'womens',
            text: 'Womens',
            id: 'womens',
            redirUrl: '/',
        },
        {
            key: 'kids',
            text: 'Kids',
            id: 'kids',
            redirUrl: '/',
        },
        {
            key: 'accessories',
            text: 'Accessories',
            id: 'accessories',
            redirUrl: '/',
        },
    ];

    dropDownItems: MenuItem[] = [
        {
            key: 'jeans',
            text: 'Jeans',
            id: 'jeans',
            click: true,
        },
        { key: 'shirt', text: 'Shirt', id: 'shirt' },
        {
            key: 'tShirt',
            text: 'T-Shirt',
            id: 'tShirt',
            redirUrl: '/',
        },
    ];

    logoAndTitle: LogoAndTitle = {
        logoImgPath: `${environment.baseUrl}/assets/images/logo.png`,
        titleText: this.configService.config?.product?.text,
        redirUrl: '/',
    };

    loginUrl = environment.loginUrl;

    ngOnInit(): void {
        if (this.service.getUserLocalData()?.data?.accessToken) {
            this.userData.isLoggedIn = true;
            this.getDetails();
            this.getCartForUser();
        } else {
            this.addProductsToCart();
        }

        this.notificationService.cart.subscribe(({ type }) => {
            if (type === ECartNotificationType.ADD) {
                this.addProductsToCart();
            }
        });
        this.initConfig();
    }

    getDetails() {
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        this.service.userDetail(tenantUrl).subscribe({
            next: res => {
                this.userData.name = `${res.name.givenName} ${res.name.familyName}`;
                this.userData.email = res.userName;
                this.removeSessionCartData(this.userData);
            },

            error: err => {
                this.loading = false;
                this.handleError(err);
            },
        });
    }

    removeSessionCartData(userData): void {
        const productIds = this.productService.getProductsLocalData()
            ?.productIds;
        if (userData.email && productIds) {
            this.productService
                .addProduct(userData.email, productIds)
                .subscribe({
                    next: () => {
                        sessionStorage.removeItem(PRODUCTDATA);
                        this.notificationService.addToCart();
                    },
                    error: (err: any) => {
                        if (err.status === 400) {
                            sessionStorage.removeItem(PRODUCTDATA);
                        }
                        this.handleError(err);
                    },
                });
        }
    }

    addProductsToCart() {
        const productIds = this.productService.getProductsLocalData()
            ?.productIds;
        if (productIds) {
            this.cartCount = productIds.length;
        } else {
            this.getCartForUser();
        }
    }

    getCartForUser() {
        this.productService.getUserProducts(this.userData.email).subscribe({
            next: (res: any) => {
                this.cartCount = res.data.length;
            },
            error: (err: any) => {
                this.handleError(err);
            },
        });
    }

    initConfig() {
        const res: any = this.configService.config;

        const parentStyles = {
            color: res?.nav?.color,
        };
        this.options = this.configService.getFormattedConfig(
            this.options,
            res,
            'nav',
            'options',
            parentStyles
        );
        this.dropDowns = this.configService.getFormattedConfig(
            this.dropDowns,
            res,
            'nav',
            'dropDowns'
        );
    }

    loginRedirect(): any {
        location.href = this.loginUrl;
    }

    handleError(err) {
        const message = err?.error?.message || DEFAULT_ERROR;
        this.notificationService.sendError(message);
        this.loading = false;
    }
}
