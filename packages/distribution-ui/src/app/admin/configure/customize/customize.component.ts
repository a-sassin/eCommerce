import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { ConfigService } from 'src/app/services/config.service';

@Component({
    selector: 'app-customize',
    templateUrl: './customize.component.html',
    styleUrls: ['./customize.component.scss'],
})
export class CustomizeComponent implements OnInit {
    public configStream: string = '';

    public colorConfigStream: string = '';

    public configParsed: any = {};

    public colorConfigParsed: any = {};

    public invalidFile: boolean = false;

    public previousConfigStream;

    constructor(
        public configService: ConfigService,
        private notification: NotificationService
    ) {}

    ngOnInit(): void {
        this.initConfig();
        this.configService.configEvent.subscribe({
            next: res => {
                this.setConfigStream(res, true);
                this.setColorConfigStream(res);
            },
        });
    }

    initConfig() {
        if (!this.configStream)
            this.setConfigStream(this.configService.config, true);
        if (!this.colorConfigStream)
            this.setColorConfigStream(this.configService.config);
    }

    setConfigStream(configParsed, calledAfterSave?) {
        this.configParsed = configParsed;
        try {
            this.configStream = JSON.stringify(
                configParsed,
                null,
                4
            ).trimStart();
            if (calledAfterSave) {
                this.previousConfigStream = this.configStream;
            }
            this.invalidFile = false;
        } catch (error) {
            this.notification.sendError(error);
            this.invalidFile = true;
        }
    }

    setColorConfigStream(configParsed) {
        this.colorConfigParsed = configParsed;
        try {
            this.colorConfigStream = JSON.stringify(
                configParsed,
                null,
                4
            ).trimStart();
        } catch (error) {
            this.notification.sendError(error);
        }
    }

    changeConfig(configParsed) {
        this.configParsed = configParsed;
        this.setConfigStream(configParsed);
    }

    changeColors() {
        this.setColorConfigStream(this.colorConfigParsed);
    }

    saveConfig() {
        this.configService.saveConfig(this.configStream, true);
    }

    saveColorConfig() {
        this.configService.saveConfig(this.colorConfigStream);
    }

    isColorPaletteChanged() {
        return this.previousConfigStream !== this.colorConfigStream;
    }

    isConfigChanged() {
        return this.previousConfigStream !== this.configStream;
    }
}
