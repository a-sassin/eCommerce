import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import environment from 'src/environments/environment';

@Component({
    selector: 'app-user-identities',
    templateUrl: './user-identities.component.html',
    styleUrls: ['./user-identities.component.scss'],
})
export class UserIdentitiesComponent implements OnInit {
    public data: any;

    public userIdentities;

    constructor(
        private http: HttpClient,
        private notification: NotificationService
    ) {}

    ngOnInit() {
        this.http.get(`${environment.baseUrl}/themes/user-json`).subscribe({
            next: (res: any) => {
                this.data = res?.data;
                this.userIdentities = res?.data;
            },
            error: (err: any) => {
                this.notification.sendError(err?.message);
            },
        });
    }

    onChange(code) {
        this.userIdentities = code;
    }

    isConfigChanged() {
        return (
            JSON.stringify(this.userIdentities) === JSON.stringify(this.data)
        );
    }

    saveUsers() {
        this.http
            .post<any>(
                `${environment.baseUrl}/user/save-users`,
                this.userIdentities
            )
            .subscribe(() => {
                this.notification.send('Updated User-Identites!');
            });
    }
}
