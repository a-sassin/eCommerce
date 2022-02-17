import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpHeaders,
    HttpContextToken,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

export const useBaseURL = new HttpContextToken(() => false);
@Injectable()
export class AccessTokenInterceptor implements HttpInterceptor {
    constructor(
        private service: AuthService,
        private configService: ConfigService
    ) {}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        let header = request;
        if (this.configService?.tenantConfig) {
            const tenantUrl = this.configService?.tenantConfig
                ?.AUTH_SERVER_BASE_URL;
            const accessToken = this.service.getUserLocalData()?.data
                ?.accessToken;
            if (request.url.includes(`${tenantUrl}/v2.0/Me`)) {
                const headers = new HttpHeaders({
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/scim+json',
                });
                header = request.clone({ headers });
            } else if (request.url.includes(`${tenantUrl}/v2.0/Users`)) {
                const { apiAccessToken } = this.service.authData;

                const headers = new HttpHeaders({
                    Authorization: `Bearer ${apiAccessToken}`,
                    Accept: 'application/scim+json',
                    'Content-Type': 'application/scim+json',
                });

                header = request.clone({ headers });
            } else {
                let options;
                if (!request.headers.get('Authorization') && !!accessToken) {
                    const headers = new HttpHeaders({
                        // ....request.headers,
                        Authorization: `Bearer ${accessToken}`,
                    });
                    options = { headers };
                }
                if (!request.url.includes('http')) {
                    const url = `${tenantUrl}/${request.url}`;
                    options = { ...options, url };
                }
                if (!options) {
                    header = request;
                } else {
                    header = request.clone(options);
                }
            }
        }

        return next.handle(header);
    }
}
