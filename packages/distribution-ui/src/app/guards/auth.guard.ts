import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(
        private readonly service: AuthService,
        private readonly router: Router
    ) {}

    canActivate(): boolean {
        if (this.service.getUserLocalData()?.data?.accessToken) {
            return true;
        }
        this.router.navigate(['/dashboard']);
        return false;
    }
}
