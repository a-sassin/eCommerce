import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, switchMap } from 'rxjs';
import environment from 'src/environments/environment';
import { Router } from '@angular/router';
import { SignupRequestPayload } from '../models/signup-component.model';
import {
    ORDERID,
    PRODUCTDATA,
    TITLEURL,
    USERDATA,
    ISDISDIALOGSHOWN,
    ISSHOWNCONSENTDIA,
} from '../util/constant';
import { UserLocalData } from '../models/user-detail.model';

interface IAuthData {
    apiAccessToken: string;
}
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly baseUrl = environment.baseUrl;

    public authData: IAuthData;

    public authSubject: Subject<IAuthData> = new Subject<IAuthData>();

    public displayName = new EventEmitter();

    constructor(private http: HttpClient, private router: Router) {}

    getUserLocalData(): any {
        const user = JSON.parse(sessionStorage.getItem(USERDATA));
        return user;
    }

    signup(payload: SignupRequestPayload, options?): Observable<any> {
        return this.http.post<any>(
            `${this.baseUrl}/auth/signUp`,
            payload,
            options
        );
    }

    logout() {
        sessionStorage.removeItem(USERDATA);
        sessionStorage.removeItem(ORDERID);
        sessionStorage.removeItem(PRODUCTDATA);
        sessionStorage.removeItem(TITLEURL);
        sessionStorage.removeItem(ISDISDIALOGSHOWN);
        sessionStorage.removeItem(ISSHOWNCONSENTDIA);
        location.href = `${this.baseUrl}/logout`; // TODO add theme id
    }

    userDetail(tenantUrl: string): Observable<any> {
        return this.http.get<any>(`${tenantUrl}/v2.0/Me`);
    }

    updateUserDetails(payload: any, tenantUrl: string): Observable<any> {
        const id = this.getUserLocalData()?.data?.profile?.id;
        return this.http.patch<any>(`${tenantUrl}/v2.0/Users/${id}`, payload);
    }

    fetchAPIAccessToken() {
        return fetch(environment.redirectUrl).then(response => response.json());
    }

    deleteAccount() {
        const userData: any = this.getUserLocalData();
        const userFilteredData: UserLocalData = {
            userId: userData?.data?.profile?.id,
            issuerUrl: userData?.data?.issuer,
        };
        const username = userData?.data?.profile?.username;
        return this.http
            .delete(
                `${userFilteredData.issuerUrl}/v2.0/Users/${userFilteredData.userId}`
            )
            .pipe(
                switchMap(() => {
                    if (username) {
                        return this.http.delete<any>(
                            `${this.baseUrl}/product/clear-cart`,
                            {
                                params: {
                                    username,
                                },
                            }
                        );
                    }
                    return null;
                })
            );
    }

    refreshToken() {
        return this.http.get(`${environment.redirectUrl}`, {
            withCredentials: true,
        });
    }
}
