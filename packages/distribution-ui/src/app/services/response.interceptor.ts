// import { Inject, Injectable, InjectionToken } from '@angular/core';
// import {
//     HttpRequest,
//     HttpHandler,
//     HttpEvent,
//     HttpInterceptor,
//     HttpHeaders,
//     HttpContextToken,
//     HTTP_INTERCEPTORS,
// } from '@angular/common/http';
// import { Observable, timeout } from 'rxjs';
// import { AuthService } from './auth.service';
// import { ConfigService } from './config.service';

// export const useBaseURL = new HttpContextToken(() => false);
// export const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');

// @Injectable()
// export class ResponseInterceptor implements HttpInterceptor {
//     constructor(
//         private service: AuthService,
//         private configService: ConfigService,
//         @Inject(DEFAULT_TIMEOUT) protected defaultTimeout: number
//     // ) {}

//     intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
//         this.authService = this.injector.get(AuthService);

//         // Handle request
//         request = this.addAuthHeader(request);

//         // Handle response
//         return next.handle(request).pipe(catchError(error => {
//             return this.handleResponseError(error, request, next);
//         }));
//     }

// }

// export const ReponseInterceptorProvider = {
//     provide: HTTP_INTERCEPTORS,
//     useClass: ResponseInterceptor,
//     multi: true
// };
