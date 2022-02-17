import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged, EMPTY, startWith, switchMap, tap } from 'rxjs';
import {
    ButtonInterface,
    FormFeildInterface,
} from 'src/app/models/admin-setup.model';
import { AdminService } from 'src/app/services/admin.service';
import { ConfigService, ETenantConfig } from 'src/app/services/config.service';
import {
    ESetupResultType,
    ISetupTestResult,
    SetupService,
} from '../setup.service';

@Component({
    selector: 'app-tenant-configuration',
    templateUrl: './tenant-configuration.component.html',
    styleUrls: ['./tenant-configuration.component.scss'],
})
export class TenantConfigurationComponent implements OnInit {
    public tenantConfig = this.tenantService.tenantConfig;

    public inputType: FormFeildInterface[] = [];

    public hiddenFields: string[] = ['TITLE', 'DEFAULT'];

    public readOnlyFields: string[] = ['OIDC_REDIRECT_URI'];

    buttonType: ButtonInterface = { type: 'submit', name: 'Save' };

    tenantConfigureForm: FormGroup;

    tenantConnectionValidity: ISetupTestResult;

    errorData: any;

    constructor(
        private readonly service: AdminService,
        private readonly tenantService: ConfigService,
        private readonly setupService: SetupService
    ) {}

    ngOnInit(): void {
        this.generateFormFields();
        this.createtenantConfigureForm();
        const { tenantConfig } = this;
        const missingRequiredValues =
            Object.keys(tenantConfig).filter(
                key => key !== 'THEME_ID' && !tenantConfig[key]
            ) || [];
        if (missingRequiredValues?.length) {
            this.tenantConnectionValidity = {
                type: ESetupResultType.APPLICATION,
                success: false,
                message: `Following required values are missing, the functionalities will not work untill we enter valid values for following fields - ${JSON.stringify(
                    missingRequiredValues
                )}`,
            };
        } else {
            this.setupService.testISVApplicationConfiguration();
            this.setupService.testResults.subscribe((res: ISetupTestResult) => {
                if (res?.type === ESetupResultType.APPLICATION) {
                    this.tenantConnectionValidity = res;
                    this.errorData = res?.data;
                }
            });
        }
    }

    getFormLabel(str) {
        return str.toUpperCase().replace(/[_]/g, ' ');
    }

    generateFormFields() {
        const config = Object.keys(this.tenantConfig);
        config.forEach(key => {
            this.inputType.push({
                label: this.getFormLabel(key),
                formName: key,
                readonly: key === ETenantConfig.OIDC_REDIRECT_URI && true,
                type:
                    key === ETenantConfig.OIDC_CLIENT_SECRET ||
                    key === ETenantConfig.API_CLIENT_SECRET
                        ? 'password'
                        : 'text',
            });
        });
    }

    createtenantConfigureForm(): any {
        const formGroup = {};
        const config = Object.keys(this.tenantConfig);
        const urlPattern =
            '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
        config.forEach(key => {
            if (
                key !== ETenantConfig.AUTH_SERVER_BASE_URL &&
                key !== ETenantConfig.THEME_ID &&
                key !== ETenantConfig.OIDC_BASE_URI
            ) {
                formGroup[key] = new FormControl(
                    this.tenantConfig[key],
                    Validators.required
                );
            } else if (key === ETenantConfig.THEME_ID) {
                formGroup[key] = new FormControl(this.tenantConfig[key]);
            } else if (key === ETenantConfig.OIDC_BASE_URI) {
                formGroup[key] = new FormControl(
                    `${this.tenantConfig[ETenantConfig.OIDC_BASE_URI]}`,
                    Validators.required
                );
                formGroup[ETenantConfig.AUTH_SERVER_BASE_URL].valueChanges
                    .pipe(
                        distinctUntilChanged(),
                        switchMap(name1 => {
                            if (name1) {
                                return formGroup[
                                    ETenantConfig.AUTH_SERVER_BASE_URL
                                ].valueChanges.pipe(
                                    startWith(
                                        formGroup[
                                            ETenantConfig.AUTH_SERVER_BASE_URL
                                        ].value
                                    ),
                                    tap(value => {
                                        formGroup[
                                            ETenantConfig.OIDC_BASE_URI
                                        ].reset();
                                        formGroup[
                                            ETenantConfig.OIDC_BASE_URI
                                        ].setValue(
                                            `${value}/oidc/endpoint/default`
                                        );
                                    })
                                );
                            }
                            formGroup[ETenantConfig.OIDC_BASE_URI].reset();
                            return EMPTY;
                        })
                    )
                    .subscribe();
            } else {
                formGroup[key] = new FormControl(this.tenantConfig[key], [
                    Validators.required,
                    Validators.pattern(urlPattern),
                ]);
            }
        });
        this.tenantConfigureForm = new FormGroup(formGroup);
    }

    getHelperText(key): string {
        switch (key) {
            case ETenantConfig.AUTH_SERVER_BASE_URL:
                return 'This will be the base URL of your tenant for e.g. https://consumer.ice.ibmcloud.com';
            case ETenantConfig.ISV_APP_ID:
                return 'This will be displayed in the URL of the application you onboard in the ISV tenant.';
            case ETenantConfig.API_CLIENT_ID:
                return 'This is the privileged client ID which you will get from the API client you added with the application or created seperatedly.';
            case ETenantConfig.API_CLIENT_SECRET:
                return 'This is the privileged client secrete which you will get from the API client you added with the application or created seperatedly.';
            case ETenantConfig.OIDC_REDIRECT_URI:
                return 'This is read only field. You will need this value while onboarding an application in the ISV tenant.';
            case ETenantConfig.OIDC_CLIENT_ID:
                return 'Once you onboard and save the application is ISV, you will receive this value in the SSO tab.';
            case ETenantConfig.OIDC_CLIENT_SECRET:
                return 'Once you onboard and save the application is ISV, you will receive this value in the SSO tab.';
            case ETenantConfig.THEME_ID:
                return 'If you have existing theme registered in ISV, then add its theme ID here as well as in ISV tenant application. Otherwise use the run-setup interface to register or update your theme at both the places at one go.';
            case ETenantConfig.OIDC_BASE_URI:
                return 'This field is auto generated based on your auth server base url, however you can edit it.';
            default:
                return '';
        }
    }

    getPlaceholder(key): string {
        switch (key) {
            case ETenantConfig.AUTH_SERVER_BASE_URL:
                return 'Enter your ISV tenant base URL';
            case ETenantConfig.ISV_APP_ID:
                return 'eg. 3831951207540588264';
            case ETenantConfig.API_CLIENT_ID:
                return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
            case ETenantConfig.API_CLIENT_SECRET:
                return 'xxxxxxxxxx';
            case ETenantConfig.OIDC_CLIENT_ID:
                return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
            case ETenantConfig.OIDC_CLIENT_SECRET:
                return 'xxxxxxxxxx';
            case ETenantConfig.THEME_ID:
                return '954531ff-f5cb-480a-81f1-fa84a268e927';
            default:
                return '';
        }
    }

    onFormSubmit(): any {
        this.service.saveAdminSetup(this.tenantConfigureForm.value);
    }
}
