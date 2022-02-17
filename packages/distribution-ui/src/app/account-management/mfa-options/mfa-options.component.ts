import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { ConsentService } from 'src/app/services/consent.service';
import { EOTPType, MfaService } from 'src/app/services/mfa.service';
import {
    DEFAULT_ERROR,
    ITERATE,
    OPERATION,
    PURPOSEID,
    STATE,
} from 'src/app/util/constant';

export interface RadioButton {
    name: string;
    value: string;
}
@Component({
    selector: 'app-mfa-options',
    templateUrl: './mfa-options.component.html',
    styleUrls: ['./mfa-options.component.scss'],
})
export class MfaOptionsComponent implements OnInit {
    mfaOptionsForm: FormGroup;

    radioLabel: RadioButton[] = [
        {
            name: 'Email',
            value: 'email',
        },
        {
            name: 'SMS',
            value: 'phoneNumber',
        },
    ];

    loading: boolean = false;

    registeredNumber: string;

    registeredNumberId: string;

    constructor(
        public router: Router,
        private notificationService: NotificationService,
        private mfaService: MfaService,
        private consentService: ConsentService
    ) {}

    ngOnInit(): void {
        this.loading = true;
        this.mfaService.getEnrollments(EOTPType.SMS).subscribe(
            (res: any) => {
                this.registeredNumber = res?.smsotp[0]?.attributes?.phoneNumber;
                this.registeredNumberId = res?.smsotp[0]?.id;
                if (!this.registeredNumber && !history.state.register) {
                    this.redirectToOTPpage({ type: EOTPType.EMAIL });
                }
                this.loading = false;
            },
            err => this.handleError(err)
        );

        this.mfaService.getEnrollments(EOTPType.EMAIL).subscribe(
            () => {},
            err => this.handleError(err)
        );

        this.createmfaOptionsForm();
    }

    deleteEnrollment() {
        this.mfaService
            .deleteEnrollment(EOTPType.SMS, this.registeredNumberId)
            .subscribe({
                next: () => {
                    this.registeredNumber = null;
                    this.registeredNumberId = null;
                    this.removeConsent();
                    this.mfaService.toggleMFA('false').subscribe({
                        next: () => {
                            this.notificationService.sendSuccess(
                                'MFA enrollment removed successfully!'
                            );
                        },
                        error: () =>
                            this.notificationService.sendError(
                                'Error occured while disabling MFA!'
                            ),
                    });
                },
                error: err => this.handleError(err),
            });
    }

    createmfaOptionsForm(): any {
        this.mfaOptionsForm = new FormGroup({
            isMobOrEmail: new FormControl('phoneNumber', Validators.required),
            phoneNumber: new FormControl(null, Validators.required),
        });
    }

    mfaOption() {
        this.notificationService.sendSuccess(
            'Your selected option has been saved !'
        );
        this.router.navigate(['/account-manage/mfa-consent']);
    }

    onSelectedMfaMethod() {
        const mfaMethod = this.mfaOptionsForm.get('isMobOrEmail').value;
        const phoneNumber = this.mfaOptionsForm.get('phoneNumber')?.value;
        let type = 'email';

        if (mfaMethod === 'phoneNumber') {
            type = 'sms';
        }
        this.router.navigate(['/account-manage/mfa-consent'], {
            state: { mfaMethod, phoneNumber, type },
        });
    }

    handleError(err) {
        const message = err?.error?.message || 'Something Went Wrong';
        this.notificationService.sendError(message);
        this.loading = false;
    }

    redirectToOTPpage(data) {
        this.router.navigate(['/account-manage/mfa-otp'], {
            state: {
                ...data,
            },
        });
    }

    removeConsent() {
        const purposeId = [PURPOSEID.MFADISTRIBUTION];
        this.consentService.getConsentDescription({ purposeId }).subscribe({
            next: (res: any) => {
                const payload = [
                    {
                        op: OPERATION.ADD,
                        value: {
                            purposeId:
                                res.purposes[PURPOSEID.MFADISTRIBUTION].id,
                            state: STATE.DENY,
                            attributeId:
                                res.purposes[PURPOSEID.MFADISTRIBUTION]
                                    .attributes[ITERATE.ZERO].id,
                            accessTypeId:
                                res.purposes[PURPOSEID.MFADISTRIBUTION]
                                    .accessTypes[ITERATE.ZERO].id,
                        },
                    },
                ];

                this.consentService.updateConsent(payload).subscribe(
                    () => {},
                    err => {
                        this.notificationService.sendError(
                            err?.error?.message || DEFAULT_ERROR
                        );
                    }
                );
            },
            error: (err: any) => {
                this.notificationService.sendError(
                    err?.error?.message || DEFAULT_ERROR
                );
            },
        });
    }
}
