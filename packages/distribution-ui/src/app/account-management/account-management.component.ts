import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../common/Notification/notificationService';
import { UserLocalData } from '../models/user-detail.model';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import { DEFAULT_ERROR } from '../util/constant';

@Component({
    selector: 'app-account-management',
    templateUrl: './account-management.component.html',
    styleUrls: ['./account-management.component.scss'],
})
export class AccountManagementComponent implements OnInit {
    constructor(
        private readonly service: AuthService,
        private configService: ConfigService,
        private notificationService: NotificationService
    ) {}

    userData: UserLocalData = {
        name: 'User',
        userId: '',
        isLoggedIn: false,
    };

    loading: boolean = false;

    baseUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;

    themeId = this.configService.tenantConfig.THEME_ID || 'default';

    ngOnInit(): void {
        if (this.service.getUserLocalData()?.data?.accessToken) {
            this.userData.isLoggedIn = true;
            this.getDetails();
        }
    }

    logout() {
        this.service.logout();
        this.userData.isLoggedIn = false;
    }

    changePassword() {
        location.href = `${this.baseUrl}/authsvc/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:changepassword&login_hint=${this.userData.name}&themeId=${this.themeId}`;
    }

    getDetails() {
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        this.service.userDetail(tenantUrl).subscribe({
            next: res => {
                this.userData.name = `${res.name.givenName} ${res.name.familyName}`;
            },
            error: err => {
                this.loading = false;
                this.notificationService.sendError(
                    err?.error?.message || DEFAULT_ERROR
                );
            },
        });
    }
}
