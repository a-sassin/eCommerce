import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { UserDetail, USER_URN } from 'src/app/models/user-detail.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { ConfigService } from 'src/app/services/config.service';
import { ATTRIBUTE, DEFAULT_ERROR } from 'src/app/util/constant';

interface CardDetails {
    cardNum: string;
    cardExpiration: string;
    cardType: string;
    fullName: string;
}
@Component({
    selector: 'app-card-details',
    templateUrl: './card-details.component.html',
    styleUrls: ['./card-details.component.scss'],
})
export class CardDetailsComponent implements OnInit {
    loading: boolean = false;

    heading: string = 'Credit Card Details';

    tableHeadings: Array<string> = [
        'Full name (as shown on card)',
        'Payment type',
        'Credit card number',
        'Valid date',
    ];

    cardData: CardDetails[] = [];

    constructor(
        private service: AuthService,
        private configService: ConfigService,
        private notificationService: NotificationService,
        private commonService: CommonService
    ) {}

    ngOnInit(): void {
        this.getUserDetails();
    }

    private getUserDetails(): any {
        this.loading = true;
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        this.service.userDetail(tenantUrl).subscribe({
            next: (res: UserDetail) => {
                const fullName = this.commonService.getCustomAttribute(
                    res?.[USER_URN]?.customAttributes,
                    ATTRIBUTE.CREITCARDFULLNAME
                );
                const cardType = this.commonService.getCustomAttribute(
                    res?.[USER_URN]?.customAttributes,
                    ATTRIBUTE.CREDITCARDTYPE
                );
                const cardNum = this.commonService.getCustomAttribute(
                    res?.[USER_URN]?.customAttributes,
                    ATTRIBUTE.CARDNUMBER
                );
                const cardExpiration = this.commonService.getCustomAttribute(
                    res?.[USER_URN]?.customAttributes,
                    ATTRIBUTE.CARDEXPIRATION
                );
                if (cardExpiration && cardNum && cardType && fullName) {
                    this.cardData.push({
                        cardExpiration,
                        cardNum,
                        cardType,
                        fullName,
                    });
                }
                this.loading = false;
            },
            error: (err: any) => {
                this.loading = false;
                this.notificationService.sendError(
                    err?.error?.detail || DEFAULT_ERROR
                );
            },
        });
    }
}
