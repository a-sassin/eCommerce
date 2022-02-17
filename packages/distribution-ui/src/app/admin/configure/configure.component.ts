import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService, EConfigPath } from 'src/app/services/config.service';

@Component({
    selector: 'app-configure',
    templateUrl: './configure.component.html',
    styleUrls: ['./configure.component.scss'],
})
export class ConfigureComponent {
    constructor(private configService: ConfigService, public router: Router) {}

    dropdown: boolean = false;

    public isvTemplatePaths: any[] = Object.keys(EConfigPath).map(
        (key: string) => ({
            label: key,
            url: EConfigPath[key],
        })
    );

    openDropDown(): void {
        this.dropdown = !this.dropdown;
    }

    resetConfig() {
        const choice = confirm(
            'Are you sure you want to reset the configuration to its default state ? This will reset your additional customization settings for this application except the images, however to reset the ISV labels upload your default theme.'
        );
        if (choice) {
            this.configService.resetConfig();
        }
    }
}
