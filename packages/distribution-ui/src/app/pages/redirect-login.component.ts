import { Component } from '@angular/core';
import environment from 'src/environments/environment';

@Component({
    selector: 'app-redirect-login',
    template: `
        <div class="overlay">
            <div class="modal">
                <div class="modal-content">
                    <h6>{{ content }}</h6>
                    <div class="justify-flex-end mt-2 btn-info">
                        <a
                            routerLink="/checkout-item"
                            class="mr-2"
                            [state]="{ email: data.email }"
                            >{{ btn1 }}</a
                        >
                        <a (click)="login()" class="btn btn-left">{{ btn2 }}</a>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./common-pages.component.scss'],
})
export class RedirectLoginComponent {
    public content = `Your account already exists, Do you want to login or continue as a guest?`;

    public btn1 = 'Continue as Guest';

    public btn2 = 'Yes, I want to login';

    loginUrl = environment.loginUrl;

    readonly data = history.state;

    login(): void {
        location.href = this.loginUrl;
    }
}
