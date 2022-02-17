import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { ConfigService } from 'src/app/services/config.service';
import environment from 'src/environments/environment';
import {
    ESetupResultType,
    ISetupTestResult,
    SetupService,
} from '../setup.service';

interface ITestResults {
    testResult: ISetupTestResult;
    createResult: ISetupTestResult;
}

@Component({
    selector: 'app-theme-setup',
    templateUrl: './theme-setup.component.html',
})
export class ThemeSetupComponent implements OnInit {
    public testResults: ITestResults = {} as ITestResults;

    public themeID: string;

    public selectedTheme;

    public loadingState = {
        testResult: false,
        createResult: false,
    };

    public themeName: string = `${environment.workflow} theme`;

    @Output() public test = new EventEmitter<any>();

    constructor(
        public notificationService: NotificationService,
        private setupService: SetupService,
        private configService: ConfigService
    ) {}

    ngOnInit() {
        this.themeID = this.configService?.tenantConfig?.THEME_ID;
        this.setupService.testResults.subscribe({
            next: res => {
                if (res?.type === ESetupResultType.THEME) {
                    this.testResults.testResult = res;
                }
                this.loadingState.testResult = false;
            },
        });
    }

    onFileChange = (event: any) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            this.selectedTheme = file;
        }
    };

    uploadTheme() {
        this.testResults = {} as ITestResults;
        this.loadingState.createResult = true;
        this.setupService
            .uploadTheme(this.selectedTheme, this.themeName)
            .subscribe({
                next: () => {
                    this.loadingState.createResult = false;
                    if (!this.themeID) {
                        this.setupService.applyTheme(this.themeName);
                    }
                    this.testResults.createResult = {
                        success: true,
                        message: `Theme ${
                            this.themeID ? 'updated' : 'created'
                        } successfuly!`,
                    };
                },
                error: (err: any) => {
                    this.testResults.createResult = {
                        success: false,
                        message: err?.error?.messageDescription || err,
                    };
                    this.loadingState.createResult = false;
                },
            });
    }
}
