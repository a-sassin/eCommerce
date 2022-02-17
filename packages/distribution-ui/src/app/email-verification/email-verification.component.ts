import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import environment from 'src/environments/environment';
import { NotificationService } from '../common/Notification/notificationService';
import { ValidationService } from '../services/validation.service';

@Component({
    selector: 'app-email-verification',
    templateUrl: './email-verification.component.html',
    styleUrls: ['./email-verification.component.scss'],
})
export class EmailVerificationComponent implements OnInit {
    heading = {
        h1: 'Enter your email address',
        h2:
            "Or checkout as a guest.\n Guests don't qualify for free shipping.*",
    };

    emailVerifyForm: FormGroup;

    button = {
        btn1: 'Continue',
        btn2: 'Continue as guest',
    };

    requiredErrMessage: string = 'is required';

    guestMessage: string =
        'Guests only qualify for free shipping\n during select promotion.';

    loading: boolean;

    NOTFOUND: string = 'No Account Found';

    loginUrl = environment.loginUrl;

    constructor(
        private readonly validationServie: ValidationService,
        private readonly notificationService: NotificationService,
        public router: Router
    ) {}

    ngOnInit(): void {
        this.emailVerifyForm = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email]),
        });
    }

    onContinue(): void {
        this.loading = true;
        const email = this.emailVerifyForm.get('email').value.trim();
        this.validationServie.validateUserEmail({ email }).subscribe({
            next: (res: any) => {
                if (res.response === this.NOTFOUND) {
                    this.router.navigate(['/proceed-signup'], {
                        state: { email },
                    });
                } else {
                    this.router.navigate(['/confirm-login'], {
                        state: { email },
                    });
                }
            },
            error: err => {
                this.loading = false;
                this.notificationService.sendError(err?.error?.message);
            },
        });
    }

    guestLogin(): void {
        this.router.navigate(['/checkout-item']);
    }
}
