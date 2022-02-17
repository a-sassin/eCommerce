import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import environment from 'src/environments/environment';
import { USER_URN } from 'src/app/models/user-detail.model';
import {
    DEFAULT_ERROR,
    ATTRIBUTE,
    ISDISDIALOGSHOWN,
} from 'src/app/util/constant';
import { NotificationService } from '../common/Notification/notificationService';
import { CommonService } from '../services/common.service';
import { ConfigService } from '../services/config.service';
import { ProductsService } from '../services/products.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    constructor(
        public router: Router,
        public productService: ProductsService,
        private commonService: CommonService,
        private service: AuthService,
        private notificationService: NotificationService,
        private readonly configService: ConfigService
    ) {}

    loading: boolean = false;

    isShowDiscountDialog: boolean = false;

    subHeader: string = 'Get 10% off on your order';

    disDiacontent: string = 'If you update your birthday';

    trendingMessage: string = 'Trending Now';

    filterMessage: string = 'Filter + Sort';

    rowCount: number = 2;

    baseUrl = environment.baseUrl;

    imagePath: String = `${this.baseUrl}/assets/images/hero.png`;

    products: any;

    btnErrorDisabled: boolean;

    ngOnInit(): void {
        this.products = this.configService.config['products'];
        const isDiscountDialogShown = sessionStorage.getItem(ISDISDIALOGSHOWN);
        if (this.isUserLogin() && !isDiscountDialogShown) {
            this.getDOBUpdateDia();
        }
    }

    getDOBUpdateDia() {
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        this.service.userDetail(tenantUrl).subscribe({
            next: res => {
                const isDobUpdated = this.commonService.getCustomAttribute(
                    res?.[USER_URN]?.customAttributes,
                    ATTRIBUTE.BIRTHDAYDATE
                );
                if (!isDobUpdated) {
                    setTimeout(() => {
                        sessionStorage.setItem(ISDISDIALOGSHOWN, 'true');
                        this.isShowDiscountDialog = true;
                    }, 5000);
                }
            },
            error: err => {
                this.loading = false;
                this.btnErrorDisabled = true;
                this.handleError(err);
            },
        });
    }

    showDetailPage(product: any): any {
        this.router.navigate(['/product-details'], {
            queryParams: { id: product.productId },
        });
    }

    onUpdateDOB() {
        this.isShowDiscountDialog = false;
        this.router.navigate(['/account-manage'], {
            state: { isGetDiscount: true },
        });
    }

    isUserLogin() {
        return this.service.getUserLocalData()?.data?.accessToken;
    }

    handleError(err) {
        const message = err?.error?.message || DEFAULT_ERROR;
        this.notificationService.sendError(message);
        this.loading = false;
    }
}
