import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { ConfigService } from 'src/app/services/config.service';

const webSafeFonts: string[] = [
    'Arial, sans-serif',
    'Arial Black, sans-serif',
    'Verdana, sans-serif',
    'Tahoma, sans-serif',
    'Trebuchet MS, sans-serif',
    'Impact, sans-serif',
    'Times New Roman, serif',
    'Didot, serif',
    'Georgia, serif',
    'American Typewriter, serif',
    'Andalé Mono, monospace',
    'Courier, monospace',
    'Lucida Console, monospace',
    'Monaco, monospace',
    'Bradley Hand, cursive',
    'Brush Script MT, cursive',
    'Luminari, fantasy',
    'Comic Sans MS, cursive',
];

@Component({
    selector: 'app-color-palette',
    templateUrl: './color-palette.component.html',
    styleUrls: ['./color-palette.component.scss'],
})
export class ColorPaletteComponent implements OnInit {
    public configStream: string = '';

    public colorConfigStream: string = '';

    public configParsed: any = {};

    public colorConfigParsed: any = {};

    public invalidFile: boolean = false;

    public previousConfigStream;

    public fonts: string[] = webSafeFonts;

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
        this.listInstalledFonts();
    }

    initConfig() {
        if (!this.configStream)
            this.setConfigStream(this.configService.config, true);
        if (!this.colorConfigStream)
            this.setColorConfigStream(this.configService.config);
    }

    listInstalledFonts() {
        let { fonts }: any = document;
        const it = fonts.entries();

        let arr = [];
        let done = false;

        while (!done) {
            const font = it.next();
            const fontFamily: string = font?.value?.[0]?.family;
            if (!font.done && !arr.includes(`${fontFamily}, sans-serif`)) {
                arr.push(`${fontFamily}, sans-serif`);
            } else {
                done = font.done;
            }
        }
        this.fonts = [...arr, ...this.fonts];
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