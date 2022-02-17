import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { PurposeService } from '../purpose.service';
import { SetupService } from '../setup.service';

@Component({
    selector: 'app-run-setup',
    templateUrl: './run-setup.component.html',
    styleUrls: ['./run-setup.component.scss'],
})
export class RunSetupComponent implements OnInit {
    private enableRunTestOnLoad: boolean = true;

    constructor(
        public notificationService: NotificationService,
        private setupService: SetupService,
        private purposeService: PurposeService
    ) {}

    ngOnInit() {
        if (this.enableRunTestOnLoad) {
            this.runAllTests();
        }
    }

    runAllTests() {
        this.setupService.testISVApplicationConfiguration();
        this.setupService.getAttributes();
        // this.purposeService.testPurposes();
    }

    testAttributes() {
        this.setupService.getAttributes();
    }
}
