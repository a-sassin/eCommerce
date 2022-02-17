import { Component, OnInit } from '@angular/core';
import { ENotificationType, NotificationService } from './notificationService';

interface INotification {
    msg: string;
    type?: string;
}
@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
    public msg: string = '';

    public type: string = ENotificationType.SUCCESS;

    checkError: string = ENotificationType.ERROR;

    constructor(public notificationService: NotificationService) {}

    ngOnInit(): void {
        if (this.notificationService.err) {
            this.msg = this.notificationService.err;
            this.type = ENotificationType.ERROR;
            setTimeout(() => {
                this.msg = '';
                this.notificationService.err = '';
            }, 5000);
        }

        this.notificationService.notify.subscribe(
            (notification: INotification) => {
                this.msg = notification.msg;
                this.type = notification.type || ENotificationType.SUCCESS;
                setTimeout(() => {
                    this.msg = '';
                }, 10000);
            }
        );
    }

    close(): void {
        this.msg = '';
    }
}
