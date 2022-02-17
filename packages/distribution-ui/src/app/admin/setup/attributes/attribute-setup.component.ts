import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { ATTRIBUTE, ISVError } from 'src/app/util/constant';
import {
    ESetupResultType,
    ISetupTestResult,
    ITestButtonProps,
    SetupService,
} from '../setup.service';

interface ITestResults {
    testAttrubuteResult: ISetupTestResult;
    createAttrubuteResult: ISetupTestResult;
}

@Component({
    selector: 'app-attribute-setup',
    templateUrl: './attribute-setup.component.html',
})
export class AttributeSetupComponent implements OnInit {
    public testResults: ITestResults = {} as ITestResults;

    public testAttributeButton: ITestButtonProps;

    public fixAttributeButton: ITestButtonProps;

    public loadingState = {
        testAttrubuteResult: false,
        createAttrubuteResult: false,
    };

    @Output() public test = new EventEmitter<any>();

    constructor(
        public notificationService: NotificationService,
        private setupService: SetupService
    ) {}

    ngOnInit() {
        this.setupService.testResults.subscribe({
            next: res => {
                if (res?.type === ESetupResultType.ATTR) {
                    this.testResults.testAttrubuteResult = res;
                }
                this.loadingState.testAttrubuteResult = false;
            },
        });
    }

    getAttributes() {
        return Object.values(ATTRIBUTE);
    }

    testAttributes = () => {
        this.test.emit();
    };

    createAttributes = () => {
        if (
            !this.testResults.testAttrubuteResult.data ||
            this.testResults.testAttrubuteResult.success
        ) {
            this.testResults.createAttrubuteResult = {
                success: true,
                message: 'All attributes are already created!',
            };
            return;
        }
        this.loadingState.createAttrubuteResult = true;
        this.setupService
            .createAttributes(this.testResults.testAttrubuteResult.data)
            .subscribe({
                next: res => {
                    const errors = res
                        .filter(r => r?.error)
                        .map(r => r?.error?.messageDescription);
                    this.setupService.getAttributes();
                    if (errors?.length) {
                        this.testResults.createAttrubuteResult = {
                            success: false,
                            message: `Received following errors while creating attributes -> ${errors.join(
                                ','
                            )}`,
                        };
                    } else {
                        this.testResults.createAttrubuteResult = {
                            success: true,
                            message:
                                'All the missing attributes created successfully!',
                        };
                    }
                },
                error: (err: ISVError) => {
                    this.testResults.createAttrubuteResult = {
                        success: false,
                        message: err.message,
                    };
                    this.loadingState.createAttrubuteResult = false;
                },
                complete: () => {
                    this.loadingState.createAttrubuteResult = false;
                },
            });
    };
}
