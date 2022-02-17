import { Component } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';

@Component({
    selector: 'app-terms',
    templateUrl: './terms.component.html',
    styleUrls: ['./terms.component.scss'],
})
export class TermsComponent {
    productName: string;

    constructor(configService: ConfigService) {
        this.productName = configService.config.product.text;
    }
}
