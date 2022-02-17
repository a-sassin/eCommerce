import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { EOTPType, MfaService } from 'src/app/services/mfa.service';
import { DEFAULT_ERROR } from 'src/app/util/constant';

@Component({
    selector: 'app-mfa-otp',
    templateUrl: './mfa-otp.component.html',
    styleUrls: ['./mfa-otp.component.scss'],
})
export class MfaOtpComponent implements OnInit {
    mfaOtpVerification: any = {};

    count: Number = 0;

    loading: boolean = false;

    otp: string = '';

    state;

    correlation: string;

    countDownTime: string;

    error: string = '';

    interval: any;

    ngOnInit() {
        this.state = history?.state;
        if (this.state?.type === EOTPType.EMAIL) {
            this.onResendOtp();
        } else if (this.state?.type === EOTPType.SMS) {
            this.initCountDown(this.state?.expiry);
            this.correlation = this.state?.correlation;
        }
    }

    constructor(
        public router: Router,
        private notificationService: NotificationService,
        private mfaService: MfaService
    ) {}

    onSubmit() {
        const { otp } = this;
        this.mfaOtpVerification.otp = otp;
        this.loading = true;
        if (this.state?.type === EOTPType.SMS) {
            this.mfaService
                .registrationOtp({ ...this.state, ...this.mfaOtpVerification })
                .subscribe(
                    (res: any) => {
                        this.notificationService.sendSuccess(res?.message);
                        this.correlation = res?.data?.correlation;
                        this.loading = false;
                        this.mfaService.toggleMFA('true').subscribe(
                            () => {},
                            () =>
                                this.notificationService.sendError(
                                    'Error occured while enabling MFA!'
                                )
                        );
                        this.router.navigate(['/account-manage/mfa-methods']);
                    },
                    (error: any) => {
                        const message =
                            error?.error?.message || 'Something Went Wrong !';
                        this.loading = false;
                        this.notificationService.sendError(message);
                    }
                );
        } else {
            this.mfaService.verifyOtp(this.mfaOtpVerification).subscribe(
                (res: any) => {
                    this.notificationService.sendSuccess(res?.message);
                    this.loading = false;
                    if (this.state?.isShowFullSSN) {
                        this.router.navigate(['/account-manage'], {
                            state: { isShowFullSSNVerified: true },
                        });
                    } else {
                        this.router.navigate(['/account-manage/mfa-methods'], {
                            state: { register: true },
                        });
                    }
                },
                (error: any) => {
                    const message =
                        error?.error?.message || 'Something Went Wrong !';
                    this.loading = false;
                    this.notificationService.sendError(message);
                }
            );
        }
    }

    onResendOtp() {
        this.loading = true;
        this.error = '';
        if (this.state.type === EOTPType.SMS) {
            this.mfaService.smsOtp({ ...this.state }).subscribe(
                res => {
                    this.correlation = res.correlation;
                    this.mfaOtpVerification.id = res.id;
                    if (!this.mfaOtpVerification?.verificationId) {
                        this.mfaOtpVerification.verificationId = this.state.verificationId;
                    }
                    this.loading = false;
                    this.initCountDown(res.expiry);
                    this.notificationService.sendSuccess(
                        'OTP sent to your phone!'
                    );
                },
                err => {
                    this.loading = false;
                    const message = err.error.message || DEFAULT_ERROR;
                    this.notificationService.sendError(message);
                }
            );
        } else {
            this.mfaService.mailOtp().subscribe(
                res => {
                    this.correlation = res.correlation;
                    this.mfaOtpVerification.id = res.id;
                    this.loading = false;
                    this.initCountDown(res.expiry);
                    this.notificationService.sendSuccess(
                        'OTP sent to your email!'
                    );
                },
                err => {
                    this.loading = false;
                    const message = err.error.message || DEFAULT_ERROR;
                    this.notificationService.sendError(message);
                }
            );
        }
    }

    initCountDown(expiry) {
        const timeLeft = this.mfaService.getCountDown(expiry).timeleft;
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = setInterval(() => {
            const countDown = this.mfaService.getCountDown(expiry);
            this.countDownTime = countDown.countDownValue;
        }, 1000);

        setTimeout(() => {
            clearInterval(this.interval);
            this.error = 'Your OTP has expired!';
        }, timeLeft);
    }
}
