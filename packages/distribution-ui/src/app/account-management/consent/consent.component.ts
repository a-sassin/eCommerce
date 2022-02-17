import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { forkJoin, switchMap } from 'rxjs';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { USER_URN } from 'src/app/models/user-detail.model';
import { AuthService } from 'src/app/services/auth.service';
import { ConfigService } from 'src/app/services/config.service';
import { ConsentService } from 'src/app/services/consent.service';
import { EOTPType, MfaService } from 'src/app/services/mfa.service';
import {
    ATTRIBUTE,
    DEFAULT_ERROR,
    FAILURE,
    ITERATE,
    OPERATION,
    PURPOSEID,
    SCHEMAS,
    ISSHOWNCONSENTDIA,
} from 'src/app/util/constant';

interface CheckboxModel {
    label: string;
    value?: boolean;
    formFieldName: string;
    display?: string;
    rule?: string;
}

@Component({
    selector: 'app-consent',
    templateUrl: './consent.component.html',
    styleUrls: ['./consent.component.scss'],
})
export class ConsentComponent implements OnInit {
    heading: string = 'Privacy and Consent';

    title: string =
        'Use this page to manage your Consents. Check or uncheck the appropriate checkboxes to manage your consents.';

    consentsDescription: CheckboxModel[] = [];

    consentManageForm: FormGroup;

    loading: boolean;

    consentData: any[] = [];

    content: any[] = [];

    terms: string = PURPOSEID.DISTRIBUTIONTERMS;

    btnErrorDisabled: boolean;

    registerMobileNumber: string;

    consentRevokePayload: any = [];

    prevConsentStatus: any = [];

    constructor(
        private notificationService: NotificationService,
        private consentService: ConsentService,
        private configService: ConfigService,
        private service: AuthService,
        private mfaService: MfaService
    ) {}

    ngOnInit(): void {
        this.createManageConsentForm();
        this.getManageConsentDetails();
    }

    handleError(err) {
        this.loading = false;
        this.notificationService.sendError(err || DEFAULT_ERROR);
    }

    createManageConsentForm(): void {
        this.consentManageForm = new FormGroup({
            [PURPOSEID.DISTRIBUTIONTERMS]: new FormControl(''),
            [PURPOSEID.COMMUNICATIONDISTRIBUTION]: new FormControl(''),
            [PURPOSEID.SHIPPINGDISTRIBUTION]: new FormControl(''),
            [PURPOSEID.CREDITCARDSTOREDISTRIBUTION]: new FormControl(''),
            [PURPOSEID.MFADISTRIBUTION]: new FormControl(''),
            [PURPOSEID.PURCHASEHISTORY]: new FormControl(''),
        });
    }

    getManageConsentDetails(): void {
        this.loading = true;
        const purposeId = [
            PURPOSEID.DISTRIBUTIONTERMS,
            PURPOSEID.COMMUNICATIONDISTRIBUTION,
            PURPOSEID.SHIPPINGDISTRIBUTION,
            PURPOSEID.CREDITCARDSTOREDISTRIBUTION,
            PURPOSEID.MFADISTRIBUTION,
            PURPOSEID.PURCHASEHISTORY,
        ];

        this.consentService.getConsentDescription({ purposeId }).subscribe({
            next: response => {
                this.consentData = Object.values(response.purposes).map(
                    (item: any) => ({
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
                    })
                );

                this.consentData.forEach(item => {
                    if (
                        item.purposeId === PURPOSEID.COMMUNICATIONDISTRIBUTION
                    ) {
                        this.consentsDescription.push({
                            label: `${item.description.slice(0, -1)} from ${
                                this.configService.config.product.text
                            }.`,
                            formFieldName: item.purposeId,
                            display: this.consentService.getConsentStyles(
                                item.legalCategory
                            ),
                        });
                    } else {
                        this.consentsDescription.push({
                            label: item.description,
                            formFieldName: item.purposeId,
                            display: this.consentService.getConsentStyles(
                                item.legalCategory
                            ),
                        });
                    }
                });

                this.content = this.consentData.map(item => ({
                    purposeId: item.purposeId,
                    accessTypeId: item.accessTypeId,
                    ...(item.attr && {
                        attributeId: item.attr?.[ITERATE.ZERO],
                    }),
                }));

                this.setConsentStatus();
            },
            error: err => {
                this.btnErrorDisabled = true;
                this.handleError(err?.error?.message);
            },
        });

        this.mfaService.getEnrollments(EOTPType.SMS).subscribe({
            next: res => {
                this.registerMobileNumber = res?.smsotp[0]?.id;
            },
            error: err => this.handleError(err?.error?.Message),
        });
    }

    setConsentStatus(): void {
        const payload = { trace: 'true', items: this.content };

        this.consentService.consentApprovalStatus(payload).subscribe({
            next: response => {
                this.loading = false;

                response.forEach(item => {
                    if (item?.result?.[ITERATE.ZERO]?.approved) {
                        this.consentManageForm
                            .get([item.purposeId])
                            .setValue(item?.result?.[ITERATE.ZERO]?.approved);
                    } else {
                        this.consentManageForm
                            .get([item.purposeId])
                            .setValue(
                                this.consentData.find(
                                    res => res.purposeId === item.purposeId
                                )?.assentUIDefault
                            );
                    }
                    this.consentsDescription = this.consentService.getAssentImplicit(
                        item.purposeId,
                        item?.result?.[ITERATE.ZERO],
                        this.consentsDescription
                    );
                    this.prevConsentStatus.push({
                        [item.purposeId]: this.consentManageForm.get([
                            item.purposeId,
                        ]).value,
                    });
                });
            },
            error: err => {
                this.btnErrorDisabled = true;
                this.handleError(err?.error?.message);
            },
        });
    }

    change(e, name): void {
        if (
            e.target.checked !==
            this.prevConsentStatus.find(id => Object.keys(id)[0] === name)?.[
                name
            ]
        ) {
            this.consentRevokePayload.push(
                ...this.consentService.addConsentPayload(
                    e.target.checked,
                    name,
                    this.consentData
                )
            );
        } else {
            this.consentRevokePayload = this.consentRevokePayload.filter(
                i => i.value.purposeId !== name
            );
        }
    }

    onSubmit(): void {
        this.loading = true;
        const updateDeatilPayload = {
            schemas: SCHEMAS,
            Operations: [],
        };

        const storeCardRevoke =
            !this.consentManageForm.get([PURPOSEID.CREDITCARDSTOREDISTRIBUTION])
                .value &&
            this.consentManageForm.get([PURPOSEID.CREDITCARDSTOREDISTRIBUTION])
                .dirty;

        const storeAddressRevoke =
            !this.consentManageForm.get([PURPOSEID.SHIPPINGDISTRIBUTION])
                .value &&
            this.consentManageForm.get([PURPOSEID.SHIPPINGDISTRIBUTION]).dirty;

        const loginConsentRevoke =
            !this.consentManageForm.get(PURPOSEID.DISTRIBUTIONTERMS).value ||
            !this.consentManageForm.get(PURPOSEID.COMMUNICATIONDISTRIBUTION)
                .value;

        const purchaseRevoke =
            !this.consentManageForm.get([PURPOSEID.PURCHASEHISTORY]).value &&
            this.consentManageForm.get([PURPOSEID.PURCHASEHISTORY]).dirty;

        const mfaRevoke =
            !this.consentManageForm.get(PURPOSEID.MFADISTRIBUTION).value &&
            this.consentManageForm.get(PURPOSEID.MFADISTRIBUTION).dirty &&
            this.registerMobileNumber;

        if (storeCardRevoke) {
            updateDeatilPayload.Operations.push(
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.CREDITCARDTYPE,
                            values: [],
                        },
                    ],
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.CARDNUMBER,
                            values: [],
                        },
                    ],
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.CARDEXPIRATION,
                            values: [],
                        },
                    ],
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.CREITCARDFULLNAME,
                            values: [],
                        },
                    ],
                }
            );
        }
        if (storeAddressRevoke) {
            updateDeatilPayload.Operations.push(
                {
                    op: OPERATION.REPLACE,
                    path: 'addresses[type eq "work"].formatted',
                    value: '',
                },
                {
                    op: OPERATION.REPLACE,
                    path: 'addresses[type eq "work"].locality',
                    value: '',
                },
                {
                    op: OPERATION.REPLACE,
                    path: 'addresses[type eq "work"].country',
                    value: '',
                },
                {
                    op: OPERATION.REPLACE,
                    path: 'addresses[type eq "work"].region',
                    value: '',
                },
                {
                    op: OPERATION.REPLACE,
                    path: 'addresses[type eq "work"].postalCode',
                    value: '',
                }
            );
        }
        if (purchaseRevoke) {
            updateDeatilPayload.Operations.push(
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.PURCHASEDPID,
                            values: [],
                        },
                    ],
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.PURCHASEDPTYPE,
                            values: [],
                        },
                    ],
                }
            );
        }
        const len = this.consentRevokePayload.length;
        let storeConsentPayload1;
        let storeConsentPayload2;
        let payloadData;

        // limit exceeded than 10 inputs, split array and called api twice.
        if (len > 10) {
            storeConsentPayload1 = this.consentRevokePayload.slice(0, len / 2);
            storeConsentPayload2 = this.consentRevokePayload.slice(
                len / 2,
                len
            );
            payloadData = [
                this.consentService.updateConsent(storeConsentPayload1),
                this.consentService.updateConsent(storeConsentPayload2),
            ];
        } else {
            payloadData = [
                this.consentService.updateConsent(this.consentRevokePayload),
            ];
        }

        forkJoin(payloadData).subscribe({
            next: ([response]) => {
                const error = response?.results?.find(
                    res => res.result === FAILURE
                );
                if (error) {
                    this.handleError(error.error);
                } else {
                    if (
                        storeCardRevoke ||
                        storeAddressRevoke ||
                        purchaseRevoke
                    ) {
                        this.removeCardDetail(response, updateDeatilPayload);
                    }
                    if (loginConsentRevoke) {
                        sessionStorage.setItem(
                            ISSHOWNCONSENTDIA,
                            JSON.stringify(true)
                        );
                    }
                    if (mfaRevoke) {
                        this.removeMFA();
                    }
                    if (
                        !storeCardRevoke &&
                        !storeAddressRevoke &&
                        !purchaseRevoke &&
                        !mfaRevoke
                    ) {
                        this.loading = false;
                        this.notificationService.sendSuccess(
                            response?.messageDescription
                        );
                    }
                    this.reset();
                }
            },
            error: (err: any) => {
                this.handleError(err?.error?.message);
            },
        });
    }

    removeCardDetail(response, payload): void {
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        this.service.updateUserDetails(payload, tenantUrl).subscribe({
            next: () => {
                this.loading = false;
                this.notificationService.sendSuccess(
                    response?.messageDescription
                );
            },
            error: (err: any) => {
                this.handleError(err?.error?.detail);
            },
        });
    }

    removeMFA(): void {
        this.mfaService
            .deleteEnrollment(EOTPType.SMS, this.registerMobileNumber)
            .pipe(switchMap(() => this.mfaService.toggleMFA('false')))
            .subscribe({
                next: () => {
                    this.loading = false;
                    this.notificationService.sendSuccess(
                        'MFA enrollment removed successfully!'
                    );
                },
                error: err => {
                    this.handleError(
                        err || 'Error occured while disabling MFA!'
                    );
                },
            });
    }

    reset(): void {
        this.consentsDescription = [];
        this.consentData = [];
        this.content = [];
        this.consentRevokePayload = [];
        this.prevConsentStatus = [];
        this.getManageConsentDetails();
    }
}
