import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { USER_URN } from 'src/app/models/user-detail.model';
import { AuthService } from 'src/app/services/auth.service';
import { ConfigService } from 'src/app/services/config.service';
import { DEFAULT_ERROR } from 'src/app/util/constant';
import environment from 'src/environments/environment';

enum ESOCIALLINK {
    FACEBOOK = 'www.facebook.com',
    GOOGLE = 'www.google.com',
}
@Component({
    selector: 'app-social-accounts',
    templateUrl: './social-accounts.component.html',
    styleUrls: ['./social-accounts.component.scss'],
})
export class SocialAccountsComponent implements OnInit {
    loading: boolean = false;

    displayText: string;

    heading: string = 'Linked Account';

    linkedEmailId: string;

    baseUrl = environment.baseUrl;

    imageSrc: string;

    googleimagePath: string = `${this.baseUrl}/assets/icons/google.png`;

    facebookimagePath: string = `${this.baseUrl}/assets/icons/facebook.png`;

    constructor(
        private service: AuthService,
        private configService: ConfigService,
        private notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        this.getUserDetails();
    }

    private getUserDetails(): any {
        this.loading = true;
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        this.service.userDetail(tenantUrl).subscribe({
            next: res => {
                this.loading = false;
                const data = res?.[USER_URN]?.linkedAccounts;
                if (data) {
                    this.linkedEmailId = data?.[0]?.externalId;
                    const socialLoginLink = data?.[0]?.realm;
                    if (socialLoginLink === ESOCIALLINK.GOOGLE) {
                        this.displayText = 'Google';
                        this.imageSrc = this.googleimagePath;
                    } else if (socialLoginLink === ESOCIALLINK.FACEBOOK) {
                        this.displayText = 'Facebook';
                        this.imageSrc = this.facebookimagePath;
                    }
                } else {
                    this.displayText = "You have'nt linked your social account";
                    this.imageSrc = '';
                }
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
