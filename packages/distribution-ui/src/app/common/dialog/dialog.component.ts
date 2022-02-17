import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
    @Input() header: string;

    @Input() content: string;

    @Input() subHeader: string;

    @Input() show: boolean = false;

    @Input() isTransparent: boolean = false;

    @Input() modalName: string = '';

    @Input() isDeleteModal: boolean = false;

    @Input() isDiscountModal: boolean = false;
}
