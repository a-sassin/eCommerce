import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { AuthService } from 'src/app/services/auth.service';
import {
    ConfigService,
    ETenantConfig,
    ITenantConfig,
} from 'src/app/services/config.service';
import {
    ATTRIBUTE,
    booleanAttributes,
    ISVError,
    uniqueAttributes,
} from 'src/app/util/constant';
import environment from 'src/environments/environment';

interface ISchemaAttribute {
    customAttribute: boolean;
    name: string;
    scimFilter?: string;
    scimName: string;
    attributeName?: string;
}

interface IAttribute {
    constraints?: any;
    datatype: string;
    description?: string;
    id?: string;
    name: string;
    schemaAttribute: ISchemaAttribute;
    scope?: string;
    sourceType: string;
    tags: string[];
}

export interface ISetupTestResult {
    type?: string;
    success: boolean;
    data?: any;
    message?: string;
}

export interface ITestButtonProps {
    label: string;
    action: Function;
}

export enum ESetupResultType {
    ATTR = 'Attribute',
    APPLICATION = 'Application',
    THEME = 'Theme',
}

export interface IApplicationDetails {
    name: string;
    customization: { themeId: string };
    apiAccessClients: {
        clientId: string;
        clientSecret: string;
        enabled: boolean;
    }[];
    providers: {
        oidc: {
            properties: {
                clientId: string;
                clientSecret: string;
                redirectUris: string[];
            };
        };
    };
    _links: {
        self: {
            href: string;
        };
    };
}

const errorPrefix: string =
    'Some pre-requisites settings are missing, some features might not work properly -';
@Injectable({
    providedIn: 'root',
})
export class SetupService {
    public attributes;

    public numberOfAttributes = 100;

    public availableCustomAttributes: string[] = [];

    public application;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private notification: NotificationService,
        private configService: ConfigService
    ) {}

    public testResults: any = new EventEmitter();

    public getAttributes() {
        const apiAccessToken = this.authService?.authData?.apiAccessToken;
        const headers: HttpHeaders = new HttpHeaders({
            Authorization: `Bearer ${apiAccessToken}`,
        });
        this.http
            .get<any>(`v2.0/Schema/attributes?filter=customAvailable`, {
                headers,
            })
            .subscribe({
                next: (res: any) => {
                    this.availableCustomAttributes = res?.Resources?.map(
                        resource => resource.name
                    );
                },
                error: (err: ISVError) => {
                    this.availableCustomAttributes = [];
                    this.notification.sendError(
                        `${errorPrefix} ${err.message}`
                    );
                },
            });
        this.http
            .get<any>(
                `v1.0/attributes?search= (scope="tenant"%26sourceType="schema")`,
                { headers }
            )
            .subscribe({
                next: (res: IAttribute[]) => {
                    this.attributes = res;
                    this.testAttributes(Object.values(ATTRIBUTE));
                },
                error: (err: ISVError) => {
                    this.notification.sendError(
                        `${errorPrefix} ${err.message}`
                    );
                },
            });
    }

    public createAttributes(attributeIds: string[]) {
        const apiAccessToken = this.authService?.authData?.apiAccessToken;
        const headers: HttpHeaders = new HttpHeaders({
            Authorization: `Bearer ${apiAccessToken}`,
        });
        const apiData = [];
        attributeIds.forEach((attrId, index) => {
            const schemaAttribute: ISchemaAttribute = {
                customAttribute: true,
                name: `${this.availableCustomAttributes[index]}`,
                scimName: attrId,
            };
            const attrPayload: IAttribute = {
                constraints: {
                    writeAccessForEndUser: true,
                    mandatory: false,
                    unique: uniqueAttributes.includes(attrId),
                },
                schemaAttribute,
                datatype: booleanAttributes.includes(attrId)
                    ? 'boolean'
                    : 'string',
                name: attrId,
                scope: 'tenant',
                sourceType: 'schema',
                tags: ['prov', 'sso'],
            };
            apiData.push(
                this.http
                    .post<any>(`v1.0/attributes`, attrPayload, { headers })
                    .pipe(catchError(error => of(error)))
            );
        });
        return forkJoin(apiData);
    }

    public testAttributes(requiredAttributeIds: string[]) {
        const missingAttributeIds: string[] = [];
        requiredAttributeIds.forEach(requiredAttrId => {
            if (
                !this.attributes?.find(
                    (attr: IAttribute) =>
                        requiredAttrId === attr.schemaAttribute.scimName
                )
            ) {
                missingAttributeIds.push(requiredAttrId);
            }
        });
        const result: ISetupTestResult = {
            type: ESetupResultType.ATTR,
            success: !missingAttributeIds.length,
            data: missingAttributeIds,
            message: !missingAttributeIds.length
                ? 'Test was successful! All of the required attributes are present in the tenant!'
                : `Test failed! following attributes are missing in the given tenant - ${JSON.stringify(
                      missingAttributeIds
                  )}`,
        };
        this.testResults.emit(result);
    }

    testISVApplicationConfiguration() {
        const apiAccessToken = this.authService?.authData?.apiAccessToken;

        const headers: HttpHeaders = new HttpHeaders({
            Authorization: `Bearer ${apiAccessToken}`,
        });
        if (this.application) {
            this.isvAppTest();
        }
        this.http
            .get<any>(
                `${environment.baseUrl}/setup/getApplicationDetails/${this.configService?.tenantConfig?.ISV_APP_ID}`,
                {
                    headers,
                }
            )
            .subscribe({
                next: (application: IApplicationDetails) => {
                    this.application = application;
                    this.isvAppTest();
                },
                error: (err: any) => {
                    this.isvErrorTest(`${errorPrefix} ${err}`);
                },
            });
    }

    isvAppTest() {
        const { application } = this;
        const tenantConfig: ITenantConfig = this.configService?.tenantConfig;
        const isValidTheme: boolean =
            !!tenantConfig.THEME_ID &&
            application?.customization?.themeId === tenantConfig.THEME_ID;
        const validationData: { [key: string]: boolean } = {
            [ETenantConfig.ISV_APP_ID]: !!application?.name,
            [ETenantConfig.OIDC_CLIENT_ID]:
                application?.providers?.oidc?.properties?.clientId ===
                tenantConfig.OIDC_CLIENT_ID,
            [ETenantConfig.OIDC_CLIENT_SECRET]:
                application?.providers?.oidc?.properties?.clientSecret ===
                tenantConfig.OIDC_CLIENT_SECRET,
            [ETenantConfig.API_CLIENT_ID]:
                application?.apiAccessClients[0]?.clientId ===
                tenantConfig.API_CLIENT_ID,
            [ETenantConfig.API_CLIENT_SECRET]:
                application?.apiAccessClients[0]?.clientSecret ===
                tenantConfig.API_CLIENT_SECRET,
            [ETenantConfig.OIDC_REDIRECT_URI]: application?.providers?.oidc?.properties?.redirectUris?.includes(
                tenantConfig.OIDC_REDIRECT_URI
            ),
            [ETenantConfig.THEME_ID]: isValidTheme,
        };
        const validationValues = Object.values(validationData);
        const isAnyValueInvalid = validationValues.some(
            (validationValue: boolean) => !validationValue
        );
        const result: ISetupTestResult = {
            type: ESetupResultType.APPLICATION,
            success: !isAnyValueInvalid,
            data: validationData,
            message: !isAnyValueInvalid
                ? 'The ISV intergration data bellow is correct and up to date!'
                : `Test failed! We have found few issues in the ISV application configuration!`,
        };
        this.testResults.emit(result);
        let themeMessage =
            'An ISV theme is already applied for this application.';
        if (!isValidTheme) {
            themeMessage = !tenantConfig.THEME_ID
                ? 'You have not yet registered a theme for this application'
                : 'The theme ID provided does not match with the themeID applied in the ISV application configuration.';
        }
        this.testResults.emit({
            type: ESetupResultType.THEME,
            success: isValidTheme,
            data: validationData,
            message: themeMessage,
        });
    }

    isvErrorTest(err: any) {
        const localTenantData = this.configService.tenantConfig;
        const validationData: { [key: string]: boolean } = {
            [ETenantConfig.AUTH_SERVER_BASE_URL]: !!localTenantData.AUTH_SERVER_BASE_URL,
            [ETenantConfig.ISV_APP_ID]: !!localTenantData.ISV_APP_ID,
            [ETenantConfig.OIDC_CLIENT_ID]: !!localTenantData.OIDC_CLIENT_ID,
            [ETenantConfig.OIDC_CLIENT_SECRET]: !!localTenantData.OIDC_CLIENT_SECRET,
            [ETenantConfig.API_CLIENT_ID]: !!localTenantData.API_CLIENT_ID,
            [ETenantConfig.API_CLIENT_SECRET]: !!localTenantData.API_CLIENT_SECRET,
            [ETenantConfig.OIDC_REDIRECT_URI]: !!localTenantData.OIDC_REDIRECT_URI,
            [ETenantConfig.THEME_ID]: !!localTenantData.THEME_ID,
            [ETenantConfig.OIDC_BASE_URI]: !!localTenantData.OIDC_BASE_URI,
        };
        const statusCode = err?.error?.status || err?.status;
        if (statusCode === 404) {
            validationData[ETenantConfig.AUTH_SERVER_BASE_URL] = false;
            validationData[ETenantConfig.ISV_APP_ID] = false;
        } else if (statusCode === 401) {
            validationData[ETenantConfig.API_CLIENT_ID] = false;
            validationData[ETenantConfig.API_CLIENT_SECRET] = false;
            validationData[ETenantConfig.OIDC_BASE_URI] = false;
        }

        const result: ISetupTestResult = {
            type: ESetupResultType.APPLICATION,
            success: false,
            message: `Could not reach out to the provided tenant or the application, here are more details about the error - ${err
                ?.error?.message || err?.message}`,
            data: validationData,
        };
        this.testResults.emit(result);
    }

    uploadTheme(file, themeName) {
        const formData = new FormData();
        formData.append('files', file);
        const apiAccessToken = this.authService?.authData?.apiAccessToken;
        const themeID = this.configService?.tenantConfig?.THEME_ID;
        const headers: HttpHeaders = new HttpHeaders({
            Authorization: `Bearer ${apiAccessToken}`,
            'content-Type': 'multipart/form-data',
        });
        const updatedTime = new Date().getTime();
        const config = {
            description: `Theme updated at ${updatedTime}`,
            name: themeName,
        };
        formData.append('configuration', JSON.stringify(config));
        const url = `/v1.0/branding/themes`;
        let request = this.http.post<any>(url, formData, { headers });
        if (themeID) {
            request = this.http.put<any>(`${url}/${themeID}`, formData, {
                headers,
            });
        }

        return request;
    }

    applyTheme(themeName) {
        const apiAccessToken = this.authService?.authData?.apiAccessToken;
        const headers: HttpHeaders = new HttpHeaders({
            Authorization: `Bearer ${apiAccessToken}`,
        });
        const url = `/v1.0/branding/themes`;
        let themeId;
        this.http
            .get<any>(url, { headers })
            .subscribe({
                next: res => {
                    themeId = res?.themeRegistrations?.find(
                        theme => theme.name === themeName
                    )?.id;
                    this.configService.tenantConfig.THEME_ID = themeId;
                    this.saveTenantConfig(
                        this.configService.tenantConfig
                    ).subscribe({
                        next: () => {
                            this.saveISVapplication();
                        },
                        error: err => {
                            this.notification.sendError(err);
                        },
                    });
                },
                error: err => this.notification.sendError(err),
            });
    }

    saveTenantConfig(payload: ITenantConfig) {
        return this.http.put<any>(
            `${environment.baseUrl}/configure-tenant`,
            payload
        );
    }

    saveISVapplication() {
        const apiAccessToken = this.authService?.authData?.apiAccessToken;
        if (!this.application) {
            this.notification.sendError(
                'The ISV application was not found to apply the theme!'
            );
        }
        const headers: HttpHeaders = new HttpHeaders({
            Authorization: `Bearer ${apiAccessToken}`,
        });

        const payload: IApplicationDetails = {
            ...this.application,
            customization: {
                themeId: this.configService?.tenantConfig?.THEME_ID,
            },
        };
        return this.http
            .put<any>(
                `${environment.baseUrl}/setup/updateApplicationDetails/${this.configService?.tenantConfig?.ISV_APP_ID}`,
                payload,
                {
                    headers,
                }
            )
            .subscribe({
                next: (application: IApplicationDetails) => {
                    this.notification.sendSuccess(
                        'Theme applied successfully!'
                    );
                    this.application = application;
                    location.reload();
                },
                error: (err: any) => {
                    this.notification.sendError(
                        'Theme is created however it was not applied to the ISV application! Please apply it by visiting ISV tenant admin console.'
                    );
                    this.isvErrorTest(err);
                },
            });
    }
}
