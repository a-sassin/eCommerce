import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigService, EConfigPath } from 'src/app/services/config.service';

@Component({
    selector: 'app-isv-template',
    templateUrl: './isv-templates.component.html',
    styleUrls: ['./isv-templates.component.scss'],
})
export class ISVTemplateComponent implements OnInit {
    constructor(
        private configService: ConfigService,
        private route: ActivatedRoute
    ) {}

    public isvLabels;

    public code;

    public codeType;

    public path;

    ngOnInit() {
        this.isvLabels = this.configService.isvLabels;
        if (!this.isvLabels) {
            this.configService.isvTemplateEvent.subscribe({
                next: res => {
                    this.isvLabels = res;
                },
            });
        }
        this.route.queryParams.subscribe((params: any) => {
            this.path = params.path ? params.path : EConfigPath.LABELS;
            this.configService
                .getISVTemplate(this.path)
                .subscribe((res: string) => {
                    if (this.path === EConfigPath.LABELS) {
                        this.code = this.configService.convertTemplateToJSON(
                            res
                        );
                    } else {
                        this.code = res;
                    }
                });
        });
    }

    onLablesChange(labels) {
        this.isvLabels = labels;
    }

    saveLabels() {
        this.configService.saveISVTemplate(
            this.path,
            this.isvLabels,
            this.path === EConfigPath.LABELS
        );
    }
}
