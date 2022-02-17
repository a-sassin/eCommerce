import { Component, OnInit } from '@angular/core';
import { switchMap, tap, catchError, throwError } from 'rxjs';
import environment from 'src/environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
    ATTRIBUTE,
    CARDTYPE,
    DEFAULT_ERROR,
    OPERATION,
    SCHEMAS,
    ORDERID,
    PURPOSEID,
    ITERATE,
    STATE,
    FAILURE,
    PRODUCTDATA,
} from 'src/app/util/constant';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../common/Notification/notificationService';
import { Button, FormLists } from '../models/checkout-item.model';
import {
    UpdateDetails,
    UserDetail,
    USER_URN,
} from '../models/user-detail.model';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import { CommonService } from '../services/common.service';
import { nonWhitespaceRegExp, numberValidation } from '../util/validations';
import { ProductsService } from '../services/products.service';
import { ConsentService, ECONSENTSTYLE } from '../services/consent.service';
import {
    PAYMENT_DETAIL_LIST,
    PERSONAL_DETAIL_LIST,
    SHIPPING_DETAIL_LIST,
} from './checkoutFormField';

@Component({
    selector: 'app-checkout-item',
    templateUrl: './checkout-item.component.html',
    styleUrls: ['./checkout-item.component.scss'],
})
export class CheckoutItemComponent implements OnInit {
    checkoutItemForm: FormGroup;

    isCheckoutClicked: boolean;

    loadingText: string = 'Payment Under Process';

    loading: boolean;

    productDetails: any;

    baseUrl = environment.baseUrl;

    loggedIn: boolean;

    email: string = '';

    requiredErrMessage: string = ' is required.';

    consentData: any[] = [];

    content: any[] = [];

    btn: Button = {
        text: 'Pay $',
        type: 'submit',
    };

    cardOptions = [CARDTYPE.AMEX, CARDTYPE.VISA];

    formlist1: FormLists = PERSONAL_DETAIL_LIST;

    formlist2: FormLists = SHIPPING_DETAIL_LIST;

    formlist3: FormLists = PAYMENT_DETAIL_LIST;

    transparent: number = ECONSENTSTYLE.TRANSPARENT;

    hide: number = ECONSENTSTYLE.HIDE;

    constructor(
        private service: AuthService,
        private configService: ConfigService,
        private commonService: CommonService,
        private notificationService: NotificationService,
        private productService: ProductsService,
        private router: Router,
        public readonly route: ActivatedRoute,
        private consentService: ConsentService
    ) {}

    ngOnInit(): void {
        this.fetchstate();
        this.initCheckoutItemForm();
        if (this.isUserLogin()) {
            this.getUserDetails();
        }
        this.getUserProducts();
    }

    fetchstate(): void {
        if (history.state.email) {
            this.email = history.state.email;
        }
    }

    initCheckoutItemForm(): void {
        this.checkoutItemForm = new FormGroup({
            firstName: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
                Validators.required,
            ]),
            lastName: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
                Validators.required,
            ]),
            emailAddress: new FormControl(this.email, [
                Validators.email,
                Validators.pattern(nonWhitespaceRegExp),
                Validators.required,
            ]),

            address: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
                Validators.required,
            ]),
            city: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
                Validators.required,
            ]),
            state: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
                Validators.required,
            ]),
            country: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
                Validators.required,
            ]),
            zipCode: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
                Validators.required,
                Validators.pattern(numberValidation),
            ]),

            paymentType: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
                Validators.required,
            ]),
            cardNumber: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
                Validators.required,
                Validators.minLength(19),
            ]),
            validDate: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
                Validators.required,
            ]),
            fullName: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
                Validators.required,
            ]),
            securityCode: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
                Validators.required,
                Validators.minLength(3),
            ]),
            [PURPOSEID.SHIPPINGDISTRIBUTION]: new FormControl(null),
            [PURPOSEID.CREDITCARDSTOREDISTRIBUTION]: new FormControl(null),
        });
    }

    getUserProducts() {
        const productId = this.productService.getProductsLocalData()
            ?.productIds[0];
        if (productId) {
            this.productService.getProduct(productId).subscribe({
                next: (res: any) => {
                    if (res?.data) {
                        this.productDetails = res?.data;
                        this.productDetails.totalPrice =
                            Number(res?.data?.newPrice.substring(1)) + 6;
                    } else {
                        this.loading = false;
                        this.isCheckoutClicked = false;
                    }
                },
                error: (err: any) => {
                    this.loading = false;
                    this.isCheckoutClicked = false;
                    this.notificationService.sendError(
                        err?.error?.message || DEFAULT_ERROR
                    );
                },
            });
        } else {
            const username = this.service.getUserLocalData()?.data?.profile
                ?.username;
            this.productService
                .getUserProducts(username)
                .pipe(
                    switchMap((res: any): any =>
                        this.productService.getProduct(res?.data?.[0])
                    ),
                    catchError(err => throwError(() => err))
                )
                .subscribe({
                    next: (res: any) => {
                        if (res?.data) {
                            this.productDetails = res?.data;
                            this.productDetails.totalPrice =
                                Number(res?.data.newPrice.substring(1)) + 6;
                        } else {
                            this.loading = false;
                            this.isCheckoutClicked = false;
                        }
                    },
                    error: (err: any) => {
                        this.loading = false;
                        this.isCheckoutClicked = false;
                        this.notificationService.sendError(
                            err?.error?.message || DEFAULT_ERROR
                        );
                    },
                });
        }
    }

    isUserLogin() {
        return this.service.getUserLocalData()?.data?.accessToken;
    }

    private getUserDetails(): any {
        this.loading = true;
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        const purposeId = [
            PURPOSEID.SHIPPINGDISTRIBUTION,
            PURPOSEID.CREDITCARDSTOREDISTRIBUTION,
        ];

        this.service
            .userDetail(tenantUrl)
            .pipe(
                tap(userRes => {
                    this.setFormValue(userRes);
                }),
                switchMap(() =>
                    this.consentService.getConsentDescription({ purposeId })
                ),
                catchError(err => throwError(() => err))
            )
            .subscribe({
                next: consentRes => {
                    this.consentData = Object.values(consentRes.purposes).map(
                        (item: any) => ({
                            description: item.description,
                            purposeId: item.id,
                            accessTypeId: item.accessTypes[ITERATE.ZERO]?.id,
                            attr: item.attributes.map(attr => attr.id),
                            assentUIDefault:
                                item.attributes?.[ITERATE.ZERO]?.accessTypes?.[
                                    ITERATE.ZERO
                                ]?.assentUIDefault,
                            legalCategory:
                                item.attributes?.[ITERATE.ZERO]?.accessTypes?.[
                                    ITERATE.ZERO
                                ]?.legalCategory,
                        })
                    );
                    this.getConsentStatus();
                },
                error: (err: any) => {
                    this.loading = false;
                    this.notificationService.sendError(
                        err?.error?.detail ||
                            err?.error?.message ||
                            DEFAULT_ERROR
                    );
                },
            });
    }

    private setFormValue(userData: UserDetail): void {
        let creditCardNumber =
            this.commonService.getCustomAttribute(
                userData?.[USER_URN]?.customAttributes,
                ATTRIBUTE.CARDNUMBER
            ) || '';
        if (creditCardNumber) {
            creditCardNumber = `${creditCardNumber.substring(
                0,
                4
            )} ${creditCardNumber.substring(4, 8)} ${creditCardNumber.substring(
                8,
                12
            )} ${creditCardNumber.substring(12, 16)}`;
        }

        this.checkoutItemForm.patchValue({
            firstName: userData?.name?.givenName || '',
            lastName: userData?.name?.familyName || '',
            emailAddress: userData?.emails?.[0]?.value || '',

            address: userData?.addresses?.[0]?.formatted || '',
            city: userData?.addresses?.[0]?.region || '',
            state: userData?.addresses?.[0]?.locality || '',
            country: userData?.addresses?.[0]?.country || '',
            zipCode: userData?.addresses?.[0]?.postalCode || '',

            paymentType:
                this.commonService.getCustomAttribute(
                    userData?.[USER_URN]?.customAttributes,
                    ATTRIBUTE.CREDITCARDTYPE
                ) || '',
            cardNumber: creditCardNumber,
            validDate:
                this.commonService.getCustomAttribute(
                    userData?.[USER_URN]?.customAttributes,
                    ATTRIBUTE.CARDEXPIRATION
                ) || '',
            fullName:
                this.commonService.getCustomAttribute(
                    userData?.[USER_URN]?.customAttributes,
                    ATTRIBUTE.CREITCARDFULLNAME
                ) || '',
        });
    }

    private getConsentStatus(): void {
        const consentApproval = this.consentData.map(item => ({
            purposeId: item.purposeId,
            accessTypeId: item.accessTypeId,
            attributeId: item.attr?.[ITERATE.ZERO],
        }));
        const payload = { trace: 'true', items: consentApproval };
        this.consentService.consentApprovalStatus(payload).subscribe({
            next: response => {
                this.loading = false;
                response.forEach(item => {
                    if (item?.result?.[ITERATE.ZERO]?.approved) {
                        this.checkoutItemForm
                            .get([item.purposeId])
                            .setValue(item?.result?.[ITERATE.ZERO]?.approved);
                    } else {
                        this.checkoutItemForm
                            .get([item.purposeId])
                            .setValue(
                                this.consentData.find(
                                    res => res.purposeId === item.purposeId
                                )?.assentUIDefault
                            );
                    }
                    this.consentData = this.consentService.getAssentImplicit(
                        item.purposeId,
                        item?.result?.[ITERATE.ZERO],
                        this.consentData
                    );
                });
            },
            error: err => {
                this.loading = false;
                this.notificationService.sendError(
                    err?.error?.message || DEFAULT_ERROR
                );
            },
        });
    }

    onCheckoutFormSubmit() {
        this.loading = true;
        this.isCheckoutClicked = true;
        let creditCardNumber = this.checkoutItemForm
            .get('cardNumber')
            .value?.trim()
            .replace(/ /g, '');

        if (creditCardNumber.length > 16) {
            creditCardNumber = creditCardNumber.substring(0, 16);
        }

        if (!this.isUserLogin()) {
            this.loading = false;
            this.isCheckoutClicked = false;
            sessionStorage.setItem(
                ORDERID,
                JSON.stringify({ orderId: this.productDetails.productId })
            );
            this.router.navigate(['/order-placed']);
            sessionStorage.removeItem(PRODUCTDATA);
            sessionStorage.removeItem(ORDERID);
        } else {
            const fName = this.checkoutItemForm.get('firstName').value?.trim();
            const lName = this.checkoutItemForm.get('lastName').value?.trim();
            const email = this.checkoutItemForm
                .get('emailAddress')
                .value?.trim();

            const address = this.checkoutItemForm.get('address').value?.trim();
            const city = this.checkoutItemForm.get('city').value?.trim();
            const state = this.checkoutItemForm.get('state').value?.trim();
            const country = this.checkoutItemForm.get('country').value?.trim();

            const zipCode = this.checkoutItemForm.get('zipCode').value?.trim();

            const paymentType = this.checkoutItemForm
                .get('paymentType')
                .value?.trim();
            const cardNumber = creditCardNumber;
            const validDate = this.checkoutItemForm
                .get('validDate')
                .value?.trim();
            const fullName = this.checkoutItemForm
                .get('fullName')
                .value?.trim();

            const payloadRequest: UpdateDetails = {
                schemas: SCHEMAS,
                Operations: [
                    {
                        op: OPERATION.REPLACE,
                        path: 'name.givenName',
                        value: fName,
                    },
                    {
                        op: OPERATION.REPLACE,
                        path: 'name.familyName',
                        value: lName,
                    },
                    {
                        op: OPERATION.REPLACE,
                        path: 'emails[type eq "work"].value',
                        value: email,
                    },
                    {
                        op: OPERATION.ADD,
                        path: `${USER_URN}:customAttributes`,
                        value: [
                            {
                                name: ATTRIBUTE.PURCHASEDPID,
                                values: [this.productDetails.productId],
                            },
                        ],
                    },
                    {
                        op: OPERATION.ADD,
                        path: `${USER_URN}:customAttributes`,
                        value: [
                            {
                                name: ATTRIBUTE.PURCHASEDPTYPE,
                                values: [this.productDetails.productType],
                            },
                        ],
                    },
                ],
            };

            if (
                this.checkoutItemForm.get([PURPOSEID.SHIPPINGDISTRIBUTION])
                    .value
            ) {
                payloadRequest.Operations.push(
                    {
                        op: OPERATION.REPLACE,
                        path: 'addresses[type eq "work"].formatted',
                        value: address,
                    },
                    {
                        op: OPERATION.REPLACE,
                        path: 'addresses[type eq "work"].region',
                        value: city,
                    },
                    {
                        op: OPERATION.REPLACE,
                        path: 'addresses[type eq "work"].locality',
                        value: state,
                    },
                    {
                        op: OPERATION.REPLACE,
                        path: 'addresses[type eq "work"].country',
                        value: country,
                    },

                    {
                        op: OPERATION.REPLACE,
                        path: 'addresses[type eq "work"].postalCode',
                        value: zipCode,
                    }
                );
            }
            if (
                this.checkoutItemForm.get([
                    PURPOSEID.CREDITCARDSTOREDISTRIBUTION,
                ]).value
            ) {
                payloadRequest.Operations.push(
                    {
                        op: OPERATION.ADD,
                        path: `${USER_URN}:customAttributes`,
                        value: [
                            {
                                name: ATTRIBUTE.CREDITCARDTYPE,
                                values: [paymentType],
                            },
                        ],
                    },
                    {
                        op: OPERATION.ADD,
                        path: `${USER_URN}:customAttributes`,
                        value: [
                            {
                                name: ATTRIBUTE.CARDNUMBER,
                                values: [cardNumber],
                            },
                        ],
                    },
                    {
                        op: OPERATION.ADD,
                        path: `${USER_URN}:customAttributes`,
                        value: [
                            {
                                name: ATTRIBUTE.CARDEXPIRATION,
                                values: [validDate],
                            },
                        ],
                    },
                    {
                        op: OPERATION.ADD,
                        path: `${USER_URN}:customAttributes`,
                        value: [
                            {
                                name: ATTRIBUTE.CREITCARDFULLNAME,
                                values: [fullName],
                            },
                        ],
                    }
                );
            }

            this.submitForm(payloadRequest);
        }
    }

    private submitForm(payloadRequest): any {
        const consentRevokePayload = [];
        this.consentData.forEach(item => {
            item.attr.forEach(attr => {
                consentRevokePayload.push({
                    op: OPERATION.ADD,
                    value: {
                        purposeId: item.purposeId,
                        state: this.checkoutItemForm.get([item.purposeId]).value
                            ? STATE.ALLOW
                            : STATE.DENY,
                        attributeId: attr,
                        accessTypeId: item.accessTypeId,
                    },
                });
            });
        });

        this.consentService.updateConsent(consentRevokePayload).subscribe({
            next: response => {
                const error = response?.results?.find(
                    res => res.result === FAILURE
                );
                if (error) {
                    this.loading = false;
                    this.notificationService.sendError(
                        error.error || DEFAULT_ERROR
                    );
                } else {
                    this.updateUserProfile(payloadRequest);
                }
            },
            error: (err: any) => {
                this.loading = false;
                this.notificationService.sendError(
                    err?.error?.message || DEFAULT_ERROR
                );
            },
        });
    }

    updateUserProfile(payload): void {
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        const username = this.service.getUserLocalData()?.data?.profile
            ?.username;
        this.service
            .updateUserDetails(payload, tenantUrl)
            .pipe(
                switchMap(() =>
                    this.productService.addOrderId(
                        username,
                        this.productDetails.productId
                    )
                ),
                catchError(err => throwError(() => err))
            )
            .subscribe({
                next: () => {
                    this.loading = false;
                    this.isCheckoutClicked = false;
                    this.router.navigate(['/order-placed']);
                },
                error: err => {
                    this.loading = false;
                    this.isCheckoutClicked = false;
                    this.notificationService.sendError(
                        err?.error?.detail ||
                            err?.error?.message ||
                            DEFAULT_ERROR
                    );
                },
            });
    }
}
