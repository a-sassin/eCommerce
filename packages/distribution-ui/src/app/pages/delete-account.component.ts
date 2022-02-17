import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import environment from 'src/environments/environment';

@Component({
    selector: 'app-delete-account',
    template: `
        <div class="form-container form-center mt-2 delete-account-container">
            <p class="form-subtitle">
                {{ content }}
                <br />
                {{ subContent }}
                <a [href]="sanitizer.bypassSecurityTrustResourceUrl(logoutUrl)"
                    >click here</a
                >
                {{ subContent1 }}
            </p>
        </div>
    `,
    styleUrls: ['./common-pages.component.scss'],
})
export class DeleteAccountComponent {
    constructor(public sanitizer: DomSanitizer) {}

    logoutUrl: string = `${environment.baseUrl}/logout`;

    public content = `Your account has been deleted successfully.`;

    public subContent = `Please`;

    public subContent1 = `to go to home page`;
}
