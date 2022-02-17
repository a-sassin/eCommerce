import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ConfigService } from 'src/app/services/config.service';
import { ProductsService } from 'src/app/services/products.service';
import environment from 'src/environments/environment';

@Component({
    selector: 'app-purchase-history',
    templateUrl: './purchase-history.component.html',
    styleUrls: ['./purchase-history.component.scss'],
})
export class PurchaseHistoryComponent implements OnInit {
    loading: boolean = false;

    title = 'Purchase History';

    subTitle: string = 'Lorem ipsum dolor sit ame';

    purchasedDateMsg: string = 'Purchased from store on 21/12/2021';

    deliverMsg: string = 'Yet to deliver';

    reorderText: string = 'Reorder';

    downloadInvoice: string = 'Download Invoice';

    rewardPtMsg: string = 'Reward points earned 1105';

    dummyProductInfo: any;

    baseUrl = environment.baseUrl;

    constructor(
        private service: AuthService,
        private productService: ProductsService,
        private readonly configService: ConfigService
    ) {}

    productDetails: any;

    ngOnInit(): void {
        this.getUserOrders();
        [, this.dummyProductInfo] = this.configService.config['products'];
    }

    getUserOrders() {
        this.loading = true;
        const username = this.service.getUserLocalData()?.data?.profile
            ?.username;
        this.productService
            .getUserOrders(username)
            .pipe(
                switchMap((res: any): any =>
                    this.productService.getOrders(res?.data?.orderIds?.[0])
                )
            )
            .subscribe({
                next: (res: any) => {
                    this.loading = false;
                    if (res?.data) {
                        this.productDetails = res?.data;
                    }
                },
                error: () => {
                    this.loading = false;
                },
            });
    }

    numSequence(n: number): Array<number> {
        return Array(n);
    }
}
