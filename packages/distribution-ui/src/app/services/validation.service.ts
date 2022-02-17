import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import environment from 'src/environments/environment';
import { UserIdenityMatching } from '../models/user-detail.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    constructor(
        private readonly service: AuthService,
        private http: HttpClient
    ) {}

    accessToken = this.service.getUserLocalData()?.data?.accessToken;

    apiAccessToken = this.service.getUserLocalData()?.data?.apiAccessToken;

    backendUrl = environment.baseUrl;

    validateUser(payload: UserIdenityMatching): Observable<any> {
        return this.http.post<any>(
            `${this.backendUrl}/validate/identity`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            }
        );
    }

    validateUserEmail(payload: { email: string }): Observable<any> {
        return this.http.post<any>(
            `${this.backendUrl}/validate/email`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${this.apiAccessToken}`,
                },
            }
        );
    }

    displayPassword(tenantUrl: string): Observable<any> {
        return this.http.get<any>(`${tenantUrl}/v2.0/PasswordPolicies`, {
            headers: {
                Authorization: `Bearer ${this.apiAccessToken}`,
            },
        });
    }
}
