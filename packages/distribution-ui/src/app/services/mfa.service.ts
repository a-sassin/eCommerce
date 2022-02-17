import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, switchMap } from 'rxjs';
import environment from 'src/environments/environment';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';
import { UpdateDetails, USER_URN } from '../models/user-detail.model';
import { ATTRIBUTE, OPERATION, SCHEMAS } from '../util/constant';

export enum EOTPType {
    SMS = 'smsotp',
    EMAIL = 'emailotp',
}

interface IAuthData {
    apiAccessToken: string;
}
@Injectable({
    providedIn: 'root',
})
export class MfaService {
    private readonly baseUrl = environment.baseUrl;

    public authData: IAuthData;

    public headerContent: Subject<any> = new Subject<any>();

    public authSubject: Subject<IAuthData> = new Subject<IAuthData>();

    public displayName = new EventEmitter();

    constructor(
        private http: HttpClient,
        private readonly authservice: AuthService,
        private configService: ConfigService
    ) {}

    getCountDown(countDownDate) {
        const now = new Date().getTime();
        const timeleft = new Date(countDownDate).getTime() - now;
        const minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeleft % (1000 * 60)) / 1000);
        return {
            timeleft,
            countDownValue: `${minutes}:${seconds}`,
        };
    }

    mailOtp() {
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        return this.authservice.userDetail(tenantUrl).pipe(
            switchMap(res => {
                const email = res.emails[0].value;
                return this.http.post<any>(`${this.baseUrl}/mfa/mail-otp`, {
                    emailAddress: email,
                });
            })
        );
    }

    smsOtp(data) {
        return this.http.post<any>(`${this.baseUrl}/mfa/sms-otp`, {
            ...data,
        });
    }

    verifyOtp(mfaOtpVerification: any) {
        return this.http.post(`${this.baseUrl}/mfa/verify-otp`, {
            ...mfaOtpVerification,
        });
    }

    registrationMfa(...data) {
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        return this.authservice.userDetail(tenantUrl).pipe(
            switchMap(res => {
                if (data[0].mfaMethod === 'email') {
                    data[0] = {
                        ...data[0],
                        emailAddress: res.emails[0].value,
                        userId: res.id,
                    };
                } else {
                    data[0] = {
                        ...data[0],
                        userId: res.id,
                    };
                }
                return this.http.post<any>(
                    `${this.baseUrl}/mfa/registration-mfa`,
                    { ...data[0] }
                );
            })
        );
    }

    registrationOtp(data) {
        return this.http.post<any>(`${this.baseUrl}/mfa/registration-otp`, {
            ...data,
        });
    }

    getEnrollments(type) {
        return this.http.get<any>(`/v2.0/factors/${type}`);
    }

    deleteEnrollment(type, id) {
        return this.http.delete<any>(`/v2.0/factors/${type}/${id}`);
    }

    toggleMFA(state) {
        const payloadRequest: UpdateDetails = {
            schemas: SCHEMAS,
            Operations: [
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.ENABLE_MFA,
                            values: [state],
                        },
                    ],
                },
            ],
        };
        return this.authservice.updateUserDetails(
            payloadRequest,
            this.configService.tenantConfig.AUTH_SERVER_BASE_URL
        );
    }
}
