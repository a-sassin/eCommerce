import { Component } from '@angular/core';

@Component({
    selector: 'app-order-placed',
    template: `
        <div class="overlay">
            <div class="modal">
                <div class="modal-content">
                    <h6>{{ content }}</h6>
                    <div>{{ subContent1 }}</div>
                    <div>{{ subContent2 }}</div>
                    <div class="justify-flex-end mt-2">
                        <a href="/dashboard" class="btn btn-left">{{ btn }}</a>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./common-pages.component.scss'],
})
export class OrderPlacedComponent {
    public content = `Order placed successfully`;

    public subContent1 = `Order num 20293201029`;

    public subContent2 = `your order is currently being processed.`;

    public btn = 'Done';
}
