import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import environment from 'src/environments/environment';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NotificationService } from '../common/Notification/notificationService';
import { AuthService } from './auth.service';
import { CommonService } from './common.service';

export interface IConfigProp {
    key: string;
    selector?: string;
    text?: string;
    textColor?: string;
    backgroundColor?: string;
    updateISV?: boolean;
    showUI?: boolean;
}

export interface IConfig {
    product: IConfigProp;
    [key: string]: any;
}

export interface ITenantConfig {
    TITLE: string;
    API_CLIENT_ID: string;
    API_CLIENT_SECRET: string;
    AUTH_SERVER_BASE_URL: string;
    ISV_APP_ID?: string;
    ISV_APP_NAME?: string;
    OIDC_BASE_URI: string;
    OIDC_CLIENT_ID: string;
    OIDC_CLIENT_SECRET: string;
    OIDC_REDIRECT_URI: string;
    THEME_ID: string;
}

export enum ETenantConfig {
    TITLE = 'TITLE',
    API_CLIENT_ID = 'API_CLIENT_ID',
    API_CLIENT_SECRET = 'API_CLIENT_SECRET',
    AUTH_SERVER_BASE_URL = 'AUTH_SERVER_BASE_URL',
    ISV_APP_NAME = 'ISV_APP_NAME',
    ISV_APP_ID = 'ISV_APP_ID',
    OIDC_BASE_URI = 'OIDC_BASE_URI',
    OIDC_CLIENT_ID = 'OIDC_CLIENT_ID',
    OIDC_CLIENT_SECRET = 'OIDC_CLIENT_SECRET',
    OIDC_REDIRECT_URI = 'OIDC_REDIRECT_URI',
    THEME_ID = 'THEME_ID',
}

export enum EConfigPath {
    LABELS = '/common/labels/default/template_labels.properties',
    AC_CREATED_EMAIL = '/notifications/user_management/profile/default/account_created_email.xml',
    PSWD_CHANGE = '/notifications/user_management/login/default/user_password_change_not_show_email.xml',
}

const configPath: string = '/assets/config/client-config.json';
export interface EStyles {
    color?: string;
    backgroundColor?: string;
    fontFamily?: string;
}

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    public config: IConfig = null;

    public isvLabels: any;

    public commonStyleKeys = ['product', 'page', 'nav', 'form', 'button'];

    public configEvent: any = new EventEmitter();

    public tenantConfig: ITenantConfig;

    private isvProductLabel: string;

    public isvTemplateEvent: any = new EventEmitter();

    constructor(
        private http: HttpClient,
        private router: Router,
        private notificationService: NotificationService,
        private authService: AuthService,
        private titleService: Title,
        private commonService: CommonService
    ) {}

    load() {
        return new Observable(observer => {
            const apiData = {
                tenantConfig: this.fetchData(
                    `${environment.baseUrl}/configure-tenant`,
                    'tenant'
                ),
                clientConfig: this.fetchData(
                    `${environment.baseUrl}/themes/configure-client`,
                    'client'
                ),
                userData: this.fetchData(
                    `${environment.redirectUrl}`,
                    'dashboard',
                    { withCredentials: true }
                ),
            };

            forkJoin(apiData).subscribe({
                next: ({ tenantConfig, clientConfig, userData }: any) => {
                    if (tenantConfig === 'tenant') {
                        this.notificationService.sendError(
                            'Error in tenant configuration !'
                        );
                        this.router.navigate(['/admin/setup']);
                        observer.complete();
                        return;
                    }

                    this.tenantConfig = tenantConfig.data;
                    this.tenantConfig.OIDC_REDIRECT_URI = `${environment.baseUrl}${this.tenantConfig?.OIDC_REDIRECT_URI}`;

                    if (clientConfig === 'client') {
                        this.notificationService.sendError(
                            'Error in client configuration !'
                        );
                        observer.complete();
                        this.router.navigate(['/admin/setup']);
                        return;
                    }
                    // set configurable data
                    this.config = clientConfig.data;

                    if (this.commonService.isEmpty(this.config)) {
                        this.notificationService.sendError(
                            'Invalid configuration found, please reset your configuration from Admin console.'
                        );
                        observer.complete();
                        return;
                    }

                    // set page title as per configuration
                    this.titleService.setTitle(
                        this.config?.product?.text || ''
                    );

                    if (userData === 'dashboard') {
                        observer.complete();
                        this.router.navigate(['/admin/setup']);
                        return;
                    }
                    // set apiAccessToken for further use
                    userData.data.issuer = userData?.data?.issuer?.replace(
                        '/oidc/endpoint/default',
                        ''
                    );
                    sessionStorage.setItem(
                        'userdata',
                        JSON.stringify(userData)
                    );

                    this.authService.authData = {
                        apiAccessToken: userData.data.apiAccessToken,
                    };
                    // get ISV labels
                    this.getISVLabels();

                    observer.complete();
                },
                error: (err: any) => {
                    this.notificationService.sendError(err);
                },
            });
        });
    }

    private fetchData(url, statusCode, options?): any {
        return this.http
            .get(url, options)
            .pipe(catchError(() => of(statusCode)));
    }

    getTenantDetails() {
        this.http
            .get<any>(`${environment.baseUrl}/configure-tenant`)
            .subscribe({
                next: res => {
                    this.config = res;
                    this.configEvent.emit(res);
                },
            });
    }

    validateConfig() {
        const { tenantConfig } = this;
        if (
            !(
                tenantConfig &&
                tenantConfig.API_CLIENT_ID &&
                tenantConfig.API_CLIENT_SECRET &&
                tenantConfig.AUTH_SERVER_BASE_URL &&
                tenantConfig.OIDC_BASE_URI &&
                tenantConfig.OIDC_REDIRECT_URI
            )
        ) {
            this.router.navigate(['/admin/setup']);
        }
    }

    renderConfig(config: any): any {
        try {
            const result: string = JSON.stringify(config, null, 4).trimStart();
            return result;
        } catch (error) {
            return 'Failed to load data!';
        }
    }

    initConfig(): any {
        this.http.get<any>(`${environment.baseUrl}${configPath}`).subscribe({
            next: res => {
                this.config = res;
                this.configEvent.emit(res);
            },
        });
    }

    /**
     * @param  {any[]} options - the array of labels or configurable items from the angular component
     * @param  {any[]} res - the array of configurable data received from the client-config.json
     * @param  {string} compName - key of the main object, i.e. immediate child of the main config array
     * @param  {string} propName - key of the nested object which is the array we want to iterate and map with the config data
     * @param  {any} parentStyles - properties of the compName (main object) which should be applied to the child objects as well.
     */
    getFormattedConfig(options, res, compName, propName, parentStyles?) {
        if (!res || !res[compName] || !res[compName][propName]) {
            return options;
        }
        return options.map(option => {
            const foundOption = res[compName][propName].find(
                o => o.key === option.key
            );
            if (foundOption) {
                const result = {
                    ...parentStyles,
                    ...option,
                    ...foundOption,
                };
                return result;
            }
            return option;
        });
    }

    saveConfig(config, updateTemplate?: boolean): any {
        try {
            const configData =
                typeof config === 'string' ? JSON.parse(config) : config;
            if (updateTemplate) {
                const isvTemplateObj = {
                    ...this.isvLabels,
                    PRODUCT_NAME: configData?.product?.text,
                };
                if (this.isvProductLabel !== configData.product?.text) {
                    this.saveISVTemplate(
                        EConfigPath.LABELS,
                        isvTemplateObj,
                        true
                    );
                }
            }
            return this.http
                .post<any>(
                    `${environment.baseUrl}/themes/saveConfig`,
                    configData
                )
                .subscribe(() => {
                    this.initConfig();
                    this.notificationService.send('Styles applied!');
                });
        } catch (error) {
            this.notificationService.sendError(error);
            return {};
        }
    }

    resetConfig(): any {
        try {
            return this.http
                .post<any>(`${environment.baseUrl}/themes/resetConfig`, {})
                .subscribe(() => {
                    this.initConfig();
                    this.notificationService.send(
                        'Configuration is reset to its default state!'
                    );
                });
        } catch (error) {
            this.notificationService.sendError(error);
            return {};
        }
    }

    uploadImage(file, filename) {
        const formData = new FormData();
        formData.append('file', file, filename);

        return this.http
            .post<any>(`${environment.baseUrl}/themes/uploadImage`, formData)
            .subscribe(() => {
                this.initConfig();
                this.notificationService.send('Image uploaded!');
            });
    }

    uploadProductImage(file, filename) {
        const formData = new FormData();
        formData.append('file', file, filename);

        return this.http
            .post<any>(`${environment.baseUrl}/themes/uploadProduct`, formData)
            .subscribe(() => {
                this.initConfig();
                this.notificationService.send('Product Image uploaded!');
            });
    }

    convertTemplateToJSON = (labelTemplate: string): any => {
        const lines = labelTemplate
            .split(/\r?\n/)
            .filter((s: any) => !s.match(/##*/) && !s.match(/--*/) && !!s)
            .map((str: string) => {
                const line = `${str
                    .replace(/"/g, '\\"')
                    .replace('$=', '":"')
                    .replace('$', '"')}"`;
                return line;
            })
            .join(',');
        try {
            const json = JSON.parse(`{${lines}}`);
            return json;
        } catch (error) {
            return {};
        }
    };

    getISVLabels() {
        if (this.tenantConfig.THEME_ID) {
            this.getISVTemplate(EConfigPath.LABELS).subscribe((res: any) => {
                try {
                    this.isvLabels = this.convertTemplateToJSON(res);
                    this.updateThemeSettings();
                    this.isvTemplateEvent.emit(this.isvLabels);
                } catch (error) {
                    this.isvTemplateEvent.emit([]);
                }
            });
        }
    }

    updateThemeSettings() {
        let change: boolean = false;
        if (this.isvLabels?.PRODUCT_NAME !== this.config?.product?.text) {
            this.isvLabels.PRODUCT_NAME = this.config?.product?.text;
            change = true;
        }
        if (this.isvLabels?.DEMO_APPLICATION_URL !== environment.baseUrl) {
            this.isvLabels.DEMO_APPLICATION_URL = environment.baseUrl;
            change = true;
        }
        if (change) {
            this.saveISVTemplate(EConfigPath.LABELS, this.isvLabels, true);
        }
    }

    getISVTemplate(path) {
        const headers = new HttpHeaders({
            Accept: 'text/html, application/xhtml+xml, */*',
            Authorization: `Bearer ${this.authService.authData.apiAccessToken}`,
        });
        const requestOptions: any = {
            headers,
            responseType: 'text',
        };
        return this.http
            .get<any>(
                `${this.tenantConfig.AUTH_SERVER_BASE_URL}/v1.0/branding/themes/${this.tenantConfig.THEME_ID}${path}`,
                requestOptions
            )
            .pipe(map((res: any) => res));
    }

    convertJSONToTemplate(labels) {
        const template = Object.entries(labels)
            .map(([key, value]: any) => `$${key}$=${value}\n`)
            .join('');
        return template;
    }

    saveISVTemplate(path, templateJSON, saveISVLabels?) {
        const { apiAccessToken } = this.authService.authData;
        if (!templateJSON || Object.keys(templateJSON).length < 250) {
            this.notificationService.sendError(
                'The provided ISV label value is not valid, some important information is missing!'
            );
            return null;
        }
        const headers = new HttpHeaders({
            Accept: 'text/html, application/xhtml+xml, */*',
            Authorization: `Bearer ${apiAccessToken}`,
        });
        const requestOptions: any = {
            headers,
            responseType: 'text',
        };
        let template = templateJSON;
        if (saveISVLabels) {
            template = this.convertJSONToTemplate({
                ...templateJSON,
            });
        }

        const filename = 'any';
        const formData = new FormData();
        formData.append('file', new File([new Blob([template])], filename));
        return this.http
            .put<any>(
                `${this.tenantConfig.AUTH_SERVER_BASE_URL}/v1.0/branding/themes/${this.tenantConfig.THEME_ID}${path}`,
                formData,
                requestOptions
            )
            .subscribe(() => {
                if (!saveISVLabels) {
                    this.notificationService.sendSuccess('ISV theme updated!');
                }
            });
    }

    getInlineStyles = (styles: any): EStyles => ({
        ...(!!styles.color && { color: styles.color }),
        ...(!!styles.backgroundColor && {
            backgroundColor: styles.backgroundColor,
        }),
    });
}

export const configProviderFactory = (provider: ConfigService) => () =>
    provider.load();
