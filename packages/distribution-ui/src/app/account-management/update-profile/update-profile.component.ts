import { Component, OnChanges, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import {
    FormFeildInterface,
    HeaderMessage,
} from 'src/app/models/signup-component.model';
import {
    UpdateDetails,
    UserDetail,
    USER_URN,
} from 'src/app/models/user-detail.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { ConfigService } from 'src/app/services/config.service';
import {
    ATTRIBUTE,
    DEFAULT_ERROR,
    DEFAULT_SCCUESS,
    OPERATION,
    SCHEMAS,
    VALIDATION_MSSG,
    ORDERID,
    PRODUCTDATA,
    TITLEURL,
    USERDATA,
    ISDISDIALOGSHOWN,
    ISSHOWNCONSENTDIA,
} from 'src/app/util/constant';
import {
    nonWhitespaceRegExp,
    numberValidation,
} from 'src/app/util/validations';

@Component({
    selector: 'app-update-profile',
    templateUrl: './update-profile.component.html',
    styleUrls: ['./update-profile.component.scss'],
})
export class UpdateProfileComponent implements OnInit, OnChanges {
    constructor(
        private service: AuthService,
        private configService: ConfigService,
        private notificationService: NotificationService,
        public readonly route: ActivatedRoute,
        private commonService: CommonService,
        private router: Router
    ) {}

    message: HeaderMessage = {
        msg: 'Account Details',
        btn: {
            name: 'Save Changes',
            type: 'submit',
        },
    };

    date = new Date().toISOString().split('T')[0];

    loading: boolean = true;

    errMessage: string = VALIDATION_MSSG;

    formFields: FormFeildInterface[] = [
        {
            label: 'First Name',
            placeholder: 'Enter your first name',
            fieldName: 'firstName',
        },
        {
            label: 'Last Name',
            placeholder: 'Enter your last name',
            fieldName: 'lastName',
        },
        {
            label: 'Birthday',
            fieldName: 'birthdayDate',
            type: 'date',
        },
        {
            label: 'Email',
            fieldName: 'email',
            readonly: true,
            nooutline: true,
            type: 'email',
        },
        {
            label: 'Street Address',
            placeholder: 'Enter your street address',
            fieldName: 'address',
        },
        {
            label: 'City',
            placeholder: 'Enter your city name',
            fieldName: 'city',
        },
        {
            label: 'State',
            placeholder: 'Enter your state',
            fieldName: 'state',
        },
        {
            label: 'Country',
            placeholder: 'Enter your country name',
            fieldName: 'country',
        },
        {
            label: 'Zip code',
            placeholder: 'Enter your zip code number',
            fieldName: 'zipCode',
        },
    ];

    isGetDiscount: boolean = false;

    isDobUpdated: boolean;

    accountForm: FormGroup;

    public showDeleteModal: boolean = false;

    public header: string = `Delete account`;

    public subHeader: string = `Deleting your account will delete your account and any data related to it, with the exception of historical data related to your consent, and log information for past authentication attempts and any past action to modify your personal data`;

    public content: string = `Are you sure you want to delete your account? If yes, please click on CONFIRM below`;

    confirmBtnDisabled: boolean = true;

    deleteConfirmText: string = 'Account fullname (For confimation)';

    deleteErrMsg: string = 'Full name does not match !';

    isDeleteError: boolean = false;

    fullname: string = this.service.getUserLocalData()?.profile?.displayName;

    fullnameNgModelDelete: string = '';

    private readonly unsubscribeSignal: Subject<void> = new Subject<void>();

    ngOnInit(): void {
        if (history.state.isGetDiscount) {
            this.isGetDiscount = true;
        }
        this.fullname = this.service.getUserLocalData()?.data?.profile?.displayName;
        this.initAccountManageForm();
        this.getUserDetails();
    }

    initAccountManageForm(): void {
        this.accountForm = new FormGroup({
            firstName: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            lastName: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            birthdayDate: new FormControl(''),
            email: new FormControl('', [
                Validators.email,
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            address: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            city: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            state: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            country: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            zipCode: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
                Validators.pattern(numberValidation),
            ]),
        });
    }

    private getUserDetails(): any {
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        this.service
            .userDetail(tenantUrl)
            .pipe(takeUntil(this.unsubscribeSignal))
            .subscribe({
                next: (res: UserDetail) => {
                    this.setFormValue(res);
                    this.loading = false;
                },
                error: (err: any) => {
                    this.loading = false;
                    this.notificationService.sendError(
                        err?.error?.detail || DEFAULT_ERROR
                    );
                },
            });
    }

    private setFormValue(userData: UserDetail): void {
        const dob =
            this.commonService.getCustomAttribute(
                userData?.[USER_URN]?.customAttributes,
                ATTRIBUTE.BIRTHDAYDATE
            ) || '';
        this.accountForm.patchValue({
            birthdayDate: dob,
            firstName: userData?.name?.givenName,
            lastName: userData?.name?.familyName,
            email: userData?.emails?.[0]?.value,
            address: userData?.addresses?.[0]?.formatted,
            city: userData?.addresses?.[0]?.region || '',
            state: userData?.addresses?.[0]?.locality || '',
            country: userData?.addresses?.[0]?.country || '',
            zipCode: userData?.addresses?.[0]?.postalCode || '',
        });
        if (dob) {
            this.isGetDiscount = false;
        }
    }

    onManageFormSubmit(): any {
        this.loading = true;
        const fName = this.accountForm.get('firstName').value?.trim();
        const lName = this.accountForm.get('lastName').value?.trim();
        const birthdayDate = this.accountForm.get('birthdayDate').value?.trim();
        const email = this.accountForm.get('email').value?.trim();
        const address = this.accountForm.get('address').value?.trim() || '';
        const city = this.accountForm.get('city').value?.trim();
        const state = this.accountForm.get('state').value?.trim();
        const country = this.accountForm.get('country').value?.trim();
        const zipCode = this.accountForm.get('zipCode').value?.trim();

        if (birthdayDate) {
            this.isDobUpdated = true;
        }
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
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.BIRTHDAYDATE,
                            values: [birthdayDate],
                        },
                    ],
                },
            ],
        };
        this.submitForm(payloadRequest);
    }

    private submitForm(payloadRequest): any {
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        this.service
            .updateUserDetails(payloadRequest, tenantUrl)
            .pipe(takeUntil(this.unsubscribeSignal))
            .subscribe({
                next: () => {
                    this.loading = false;
                    if (this.isGetDiscount && this.isDobUpdated) {
                        this.isGetDiscount = false;
                        this.notificationService.sendDOBUpdate(
                            'Your DOB is updated successfully, you are eligible to get discount !'
                        );
                    } else {
                        this.notificationService.sendSuccess(DEFAULT_SCCUESS);
                    }

                    this.service.displayName.emit();
                },
                error: (err: any) => {
                    this.loading = false;
                    this.notificationService.sendError(
                        err?.error?.detail || DEFAULT_ERROR
                    );
                },
            });
    }

    ngOnChanges() {
        this.fullname = this.service.getUserLocalData()?.data?.profile?.displayName;
    }

    onMatchingFullname(value: any) {
        if (value !== this.fullname) {
            this.isDeleteError = true;
            this.confirmBtnDisabled = true;
        } else {
            this.confirmBtnDisabled = false;
            this.isDeleteError = false;
        }
    }

    deleteAcc() {
        this.showDeleteModal = true;
    }

    confirmDialog(): void {
        this.showDeleteModal = false;
        this.loading = true;
        this.service.deleteAccount().subscribe({
            next: () => {
                this.loading = false;
                sessionStorage.removeItem(USERDATA);
                sessionStorage.removeItem(ORDERID);
                sessionStorage.removeItem(PRODUCTDATA);
                sessionStorage.removeItem(TITLEURL);
                sessionStorage.removeItem(ISDISDIALOGSHOWN);
                sessionStorage.removeItem(ISSHOWNCONSENTDIA);
                this.router.navigate(['/delete-account']);
            },
            error: (err: any) => {
                this.loading = false;
                this.notificationService.sendError(
                    err?.error?.detail || DEFAULT_ERROR
                );
            },
        });
    }
}
