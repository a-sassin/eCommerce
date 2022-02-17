import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigService, ITenantConfig } from 'src/app/services/config.service';
import { ATTRIBUTE } from 'src/app/util/constant';
import environment from 'src/environments/environment';
import { IPurposeConfig, PurposeService } from '../purpose.service';
import { instructionHeadings } from './setup-instructions.service';

@Component({
    selector: 'app-setup-instructions',
    templateUrl: './setup-instructions.component.html',
    styleUrls: ['./setup-instructions.component.scss'],
})
export class SetupInstructionsComponent implements OnInit, AfterViewChecked {
    public instructionHeadings = instructionHeadings;

    public tenantConfig: ITenantConfig = this.configService.tenantConfig;

    public tenantUrl: string = this.tenantConfig.AUTH_SERVER_BASE_URL;

    public themeId: string = this.tenantConfig.THEME_ID || 'default';

    public applicationUrl: string = location.origin;

    public backendUrl: string = environment.baseUrl;

    public requiredPurposes: IPurposeConfig = this.purposeService.purposeConfig;

    public requiredPurposeIds: string[] = Object.keys(this.requiredPurposes);

    constructor(
        private configService: ConfigService,
        private route: ActivatedRoute,
        private purposeService: PurposeService
    ) {}

    public userIdentities;

    ngOnInit() {
        this.route.fragment.subscribe((fragment: string) => {
            const element = document.querySelector(`#${fragment}`);
            if (element) {
                element.scrollIntoView();
                element.classList.add('highlight');
            }
        });
    }

    ngAfterViewChecked() {
        this.route.fragment.subscribe((fragment: string) => {
            const element = document.querySelector(`#${fragment}`);
            if (element) {
                element.scrollIntoView();
                element.classList.add('highlight');
            }
        });
    }

    getAttributes() {
        return Object.values(ATTRIBUTE);
    }
}
