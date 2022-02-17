import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { ButtonInterface } from 'src/app/models/signup-component.model';
import { ConfigService } from 'src/app/services/config.service';
import {
    ConsentService,
    ECONSENTSTYLE,
} from 'src/app/services/consent.service';
import {
    DEFAULT_ERROR,
    ISSHOWNCONSENTDIA,
    ITERATE,
    OPERATION,
    PURPOSEID,
    STATE,
} from 'src/app/util/constant';

@Component({
    selector: 'app-create-account-consents',
    templateUrl: './create-account-consents.component.html',
    styleUrls: ['./create-account-consents.component.scss'],
})
export class CreateAccountConsentsComponent implements OnInit {
    constructor(
        private readonly configService: ConfigService,
        private notificationService: NotificationService,
        private consentService: ConsentService
    ) {}

    @Input() consentInfo: any;

    @Input() consentTerm;

    @Input() consentCommunication;

    @Input() consentValue: any;

    @Output() closeDialog: EventEmitter<any> = new EventEmitter();

    ngOnInit(): void {
        this.createAccountForm();
        this.setInitalValue();
    }

    consentForm: FormGroup;

    communication: string = PURPOSEID.COMMUNICATIONDISTRIBUTION;

    terms: string = PURPOSEID.DISTRIBUTIONTERMS;

    transparent: number = ECONSENTSTYLE.TRANSPARENT;

    hide: number = ECONSENTSTYLE.HIDE;

    public header: string = `Privacy and Consent`;

    buttonType: ButtonInterface = {
        type: 'submit',
        name: 'Save',
    };

    createAccountForm(): any {
        this.consentForm = new FormGroup({
            [PURPOSEID.COMMUNICATIONDISTRIBUTION]: new FormControl(
                null,
                Validators.required
            ),
            [PURPOSEID.DISTRIBUTIONTERMS]: new FormControl(
                null,
                Validators.required
            ),
        });
    }

    setInitalValue(): void {
        this.consentValue.forEach(item => {
            this.consentForm.get(item.purposeId).setValue(item.status);
        });
    }

    btnDisable(): boolean {
        if (
            this.consentTerm?.legalCategory === this.transparent ||
            this.consentTerm?.legalCategory === this.hide ||
            this.consentValue?.[ITERATE.ZERO]?.rule ===
                ECONSENTSTYLE.IMPLICIT ||
            this.consentForm.get([PURPOSEID.DISTRIBUTIONTERMS]).value
        ) {
            return false;
        }
        return true;
    }

    onUpdateConsent() {
        const payload = this.consentInfo.map(item => ({
            op: OPERATION.ADD,
            value: {
                purposeId: item?.purposeId,
                state: this.consentForm.get([item.purposeId]).value
                    ? STATE.ALLOW
                    : STATE.DENY,
                attributeId: item?.attributeId ? item?.attributeId : null,
                accessTypeId: item?.accessTypeId,
            },
        }));
        this.consentService.updateConsent(payload).subscribe(
            () => {
                this.closeDialog.emit();
                this.notificationService.sendSuccess(
                    'Your consent is updated successfully !'
                );
                sessionStorage.setItem(ISSHOWNCONSENTDIA, 'true');
            },
            err => {
                const message = err?.error?.message || DEFAULT_ERROR;
                this.notificationService.sendError(message);
            }
        );
    }
}
