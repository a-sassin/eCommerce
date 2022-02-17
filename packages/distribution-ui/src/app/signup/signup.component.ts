import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, filter } from 'rxjs';
import environment from 'src/environments/environment';
import { NotificationService } from '../common/Notification/notificationService';
import {
    ButtonInterface,
    ESignUpFieldName,
    FormFeildInterface,
    SignupRequestPayload,
} from '../models/signup-component.model';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import { ValidationService } from '../services/validation.service';
import { DEFAULT_ERROR } from '../util/constant';
import { nonWhitespaceRegExp } from '../util/validations';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
    loading: boolean = false;

    baseUrl = environment.baseUrl;

    heading: string = 'Create account';

    messageText: any = {
        msg1: "If you don't have an email account, ",
        msg2:
            'https://accounts.google.com/signup/v2/webcreateaccount?hl=en&flowName=GlifWebSignIn&flowEntry=SignUp',
    };

    inputType: FormFeildInterface[] = [
        {
            label: 'Email address',
            placeholder: 'Enter your email address',
            fieldName: ESignUpFieldName.email,
        },
        {
            label: 'First Name',
            placeholder: 'Enter your first name',
            fieldName: ESignUpFieldName.firstName,
        },
        {
            label: 'Last Name',
            placeholder: 'Enter your last name',
            fieldName: ESignUpFieldName.lastName,
        },
        {
            label: 'Password',
            type: 'password',
            placeholder: '**********',
            fieldName: ESignUpFieldName.password,
        },
        {
            label: 'Confirm Password',
            type: 'password',
            placeholder: '**********',
            fieldName: ESignUpFieldName.confirmPassword,
        },
    ];

    requiredErrMessage: string = ' is required.';

    buttonType: ButtonInterface = {
        type: 'submit',
        name: 'Continue',
    };

    signupForm: FormGroup = new FormGroup({});

    validateError: string;

    matching: boolean;

    email: string = '';

    emailReadOnly: boolean = false;

    pwdMinLength: any;

    passwordMinAlphaChars: any;

    pwdMaxAge: any;

    pwdInHistory: any;

    pwdMinAge: any;

    passwordMinDiffChars: any;

    passwordMinOtherChars: any;

    constructor(
        private readonly authservice: AuthService,
        public router: Router,
        public readonly route: ActivatedRoute,
        private readonly notificationService: NotificationService,
        private readonly validationServie: ValidationService,
        private configService: ConfigService
    ) {}

    ngOnInit(): void {
        this.fetchstate();
        this.createAccountForm();
        this.setCustomValidation();
        this.displayPasswordPolicies();
    }

    fetchstate(): void {
        if (history.state.email) {
            this.email = history.state.email;
            this.emailReadOnly = true;
        }
    }

    createAccountForm(): any {
        this.signupForm = new FormGroup({
            [ESignUpFieldName.password]: new FormControl(null, [
                Validators.required,
            ]),
            [ESignUpFieldName.confirmPassword]: new FormControl(null, [
                Validators.required,
            ]),
            [ESignUpFieldName.firstName]: new FormControl(null, [
                Validators.required,
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            [ESignUpFieldName.lastName]: new FormControl(null, [
                Validators.required,
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            [ESignUpFieldName.email]: new FormControl(this.email, [
                Validators.required,
                Validators.email,
            ]),
        });
    }

    displayPasswordPolicies() {
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        this.validationServie.displayPassword(tenantUrl).subscribe({
            next: (res: any) => {
                this.loading = false;
                this.pwdMinLength = res?.pwdMinLength;
                this.passwordMinAlphaChars = res?.passwordMinAlphaChars;
                this.pwdMaxAge = res?.pwdMaxAge;
                this.pwdInHistory = res?.pwdInHistory;
                this.pwdMinAge = res?.pwdMinAge;
                this.passwordMinDiffChars = res?.passwordMinDiffChars;
                this.passwordMinOtherChars = res?.passwordMinOtherChars;
            },
            error: (err: any) => {
                this.loading = false;
                this.notificationService.sendError(
                    err?.error?.message || DEFAULT_ERROR
                );
            },
        });
    }

    private setCustomValidation(): void {
        this.signupForm
            .get('confirmPassword')
            .valueChanges.pipe(
                filter(name => name && name.length > 0),
                debounceTime(50)
            )
            .subscribe(value => {
                const validatePassword = this.signupForm.get('password').value;
                if (value !== validatePassword) {
                    this.validateError = 'Password does not match';
                } else {
                    this.validateError = '';
                }
            });
    }

    onFormSubmit(): any {
        this.loading = true;
        const passwordId = this.signupForm
            .get(ESignUpFieldName.password)
            .value.replace(/-/g, '');
        const fName = this.signupForm
            .get(ESignUpFieldName.firstName)
            .value.trim();
        const lName = this.signupForm
            .get(ESignUpFieldName.lastName)
            .value.trim();
        const email = this.signupForm.get(ESignUpFieldName.email).value;

        const userCredentials: SignupRequestPayload = {
            password: passwordId,
            firstName: fName,
            lastName: lName,
            email,
        };

        this.authservice
            .signup(userCredentials, { withCredentials: true })
            .subscribe({
                next: (response: any) => {
                    this.notificationService.sendSuccess(response?.message);
                    location.href = '/redirect';
                },
                error: (err: HttpErrorResponse) => {
                    this.loading = false;
                    this.notificationService.sendError(err.error.message);
                },
            });
    }
}
