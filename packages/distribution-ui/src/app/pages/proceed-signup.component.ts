import { Component } from '@angular/core';

@Component({
    selector: 'app-proceed-signup',
    template: `
        <div class="overlay">
            <div class="modal">
                <div class="modal-content">
                    <h6>
                        {{ content }}
                        <span class="bold-text">{{ boldText }}</span>
                    </h6>

                    <div class="justify-flex-end mt-2 btn-info">
                        <a
                            routerLink="/checkout-item"
                            class="mr-2"
                            [state]="{ email: data.email }"
                            >{{ btn1 }}</a
                        >
                        <a
                            [routerLink]="['/signup']"
                            [state]="{ email: data.email }"
                            class="btn btn-left"
                            >{{ btn2 }}</a
                        >
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./common-pages.component.scss'],
})
export class ProceedSignupComponent {
    public content = `You do not already have an account, would you like to make one now to `;

    public boldText = 'save your rewards points?';

    public btn1 = 'No';

    public btn2 = 'Yes, I need account';

    readonly data = history.state;
}
