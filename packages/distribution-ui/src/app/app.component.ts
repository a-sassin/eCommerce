import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import {
    DEFAULT_ERROR,
    ITERATE,
    ISSHOWNCONSENTDIA,
    PURPOSEID,
} from 'src/app/util/constant';
import { NotificationService } from './common/Notification/notificationService';
import { AuthService } from './services/auth.service';
import { CommonService } from './services/common.service';
import { ConfigService } from './services/config.service';
import { ConsentService, ECONSENTSTYLE } from './services/consent.service';

interface CheckboxModel {
    label: string;
    value?: boolean;
    formFieldName: string;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    title = 'ISV-Distribution';

    loading: boolean;

    heading: string;

    consentData: any;

    purposeId: any;

    count: Number;

    consentsDescription: CheckboxModel[] = [];

    msg1;

    msg2;

    content: any[] = [];

    isShowConsentDia: boolean = false;

    consentInfo: any;

    consentValue: any[] = [];

    urls = ['admin', 'delete-account', 'signup', 'terms'];

    constructor(
        private router: Router,
        private service: AuthService,
        private readonly configService: ConfigService,
        private notificationService: NotificationService,
        private commonService: CommonService,
        private consentService: ConsentService
    ) {}

    ngOnInit(): void {
        this.configService.validateConfig();

        if (this.isUserLogin()) {
            const isShownConsentDia = sessionStorage.getItem(ISSHOWNCONSENTDIA);
            if (!isShownConsentDia) {
                this.getConsentsDescription();
            }
        }
    }

    checkRoutes() {
        return !this.urls.includes(this.router.url.split('/')[1]);
    }

    getConsentsDescription(): void {
        this.loading = true;
        const purposeId = [
            PURPOSEID.DISTRIBUTIONTERMS,
            PURPOSEID.COMMUNICATIONDISTRIBUTION,
        ];

        this.consentService
            .getConsentDescription({ purposeId })
            .pipe(
                map(res =>
                    Object.values(res.purposes).map((item: any) => ({
                        description: item.description,
                        purposeId: item.id,
                        accessTypeId: item.accessTypes[ITERATE.ZERO]?.id,
                        ...(item.attributes
                            ? {
                                  attr: item.attributes.map(attr => attr.id),
                                  assentUIDefault:
                                      item.attributes?.[ITERATE.ZERO]
                                          ?.accessTypes?.[ITERATE.ZERO]
                                          ?.assentUIDefault,
                                  legalCategory:
                                      item.attributes?.[ITERATE.ZERO]
                                          ?.accessTypes?.[ITERATE.ZERO]
                                          ?.legalCategory,
                              }
                            : {
                                  assentUIDefault:
                                      item.accessTypes?.[ITERATE.ZERO]
                                          ?.assentUIDefault,
                                  legalCategory:
                                      item.accessTypes?.[ITERATE.ZERO]
                                          ?.legalCategory,
                              }),
                    }))
                )
            )
            .subscribe({
                next: response => {
                    this.consentData = response;

                    this.consentData.forEach(item => {
                        if (item.purposeId === PURPOSEID.DISTRIBUTIONTERMS) {
                            this.msg1 = {
                                description: item.description,
                                legalCategory: item.legalCategory,
                            };
                        } else if (
                            item.purposeId ===
                            PURPOSEID.COMMUNICATIONDISTRIBUTION
                        ) {
                            this.msg2 = {
                                description: `${item.description.slice(
                                    0,
                                    -1
                                )} from ${
                                    this.configService.config.product.text
                                }.`,
                                legalCategory: item.legalCategory,
                            };
                        }
                    });

                    this.content = this.consentData.map(item => ({
                        purposeId: item.purposeId,
                        accessTypeId: item.accessTypeId,
                        ...(item.attr && {
                            attributeId: item.attr?.[ITERATE.ZERO],
                        }),
                    }));
                    const payload = {
                        trace: true,
                        items: this.content,
                    };
                    this.getConsentStatus(payload);
                },
                error: err => {
                    this.handleError(err);
                },
            });
    }

    getConsentStatus(payload) {
        this.consentService.consentApprovalStatus(payload).subscribe({
            next: response => {
                const approvalStatus = response.map(
                    item => item.result[0].approved
                );

                const isNeedToShowDia = JSON.parse(
                    sessionStorage.getItem(ISSHOWNCONSENTDIA)
                );

                if (approvalStatus.includes(false) && !isNeedToShowDia) {
                    this.isShowConsentDia = true;
                    this.consentInfo = response;
                }
                if (
                    approvalStatus.every(value => value === true) &&
                    !isNeedToShowDia
                ) {
                    sessionStorage.setItem(ISSHOWNCONSENTDIA, 'true');
                }

                response.forEach(item => {
                    if (item.result[ITERATE.ZERO].approved) {
                        this.consentValue.push({
                            purposeId: item.purposeId,
                            status: item.result[ITERATE.ZERO].approved,
                        });
                    } else {
                        this.consentValue.push({
                            purposeId: item.purposeId,
                            status: this.consentData.find(
                                res => res.purposeId === item.purposeId
                            )?.assentUIDefault,
                        });
                    }
                    this.consentValue = this.consentService.getAssentImplicit(
                        item.purposeId,
                        item?.result?.[ITERATE.ZERO],
                        this.consentValue
                    );
                });
            },
            error: err => {
                this.handleError(err);
            },
        });
    }

    isUserLogin() {
        return this.service.getUserLocalData()?.data?.accessToken;
    }

    handleError(err) {
        const message = err?.error?.message || DEFAULT_ERROR;
        // this.notificationService.sendError(message);

        console.log('consent error', message);

        this.loading = false;
    }
}
