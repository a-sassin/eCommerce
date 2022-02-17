import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

export interface HeaderContentProp {
    text: string;
    name: string;
    type: string; // button or link or text
    url?: string;
    textColor?: string;
    width?: string;
    height?: string;
    backgroundColor?: string;
    disabled?: boolean;
}

@Component({
    selector: 'app-dashboard-ui',
    templateUrl: './dashboard-ui.component.html',
    styleUrls: ['./dashboard-ui.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
})
export class DashboardUiComponent {
    headerOptionsBtn: HeaderContentProp[] = [
        {
            text: 'Setup',
            name: 'setup',
            url: 'setup',
            type: 'button',
            textColor: 'black',
        },
        {
            text: 'Configure',
            name: 'configure',
            type: 'button',
            url: 'configure',
            textColor: 'black',
        },
    ];

    titleProp: HeaderContentProp = {
        text: 'Admin logo',
        name: 'title',
        type: 'text',
        textColor: '#66ADE5',
        url: '/',
    };

    constructor(private readonly router: Router) {
        this.router.navigate(['admin/setup/tenant-config']);
    }
}
