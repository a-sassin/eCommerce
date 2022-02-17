import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-redirect',
    template: '',
})
export class RedirectComponent implements OnInit {
    constructor(private router: Router) {}

    ngOnInit(): void {
        const redirectPath = sessionStorage.getItem('titleURL');
        if (redirectPath) {
            this.router.navigate([redirectPath]);
        } else {
            this.router.navigate(['/dashboard']);
        }
    }
}
