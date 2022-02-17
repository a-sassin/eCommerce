import { EventEmitter, Injectable } from '@angular/core';

export enum ENotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
    INFO = 'info',
    DOB = 'dob',
}

export enum ECartNotificationType {
    ADD = 'add',
    REMOVE = 'remove',
}
@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    public notify: any = new EventEmitter();

    public cart: any = new EventEmitter();

    public err: string = '';

    send(msg) {
        this.notify.emit({ msg });
    }

    sendSuccess(msg) {
        this.notify.emit({ msg, type: ENotificationType.SUCCESS });
    }

    sendDOBUpdate(msg) {
        this.notify.emit({ msg, type: ENotificationType.DOB });
    }

    sendError(msg) {
        this.err = msg;
        this.notify.emit({ msg, type: ENotificationType.ERROR });
    }

    addToCart() {
        this.cart.emit({ type: ECartNotificationType.ADD });
    }

    removeFromCart() {
        this.notify.emit({ type: ECartNotificationType.REMOVE });
    }
}
