import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
} from '@angular/core';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { EConfigPath } from 'src/app/services/config.service';

@Component({
    selector: 'app-code-editor',
    templateUrl: './code-editor.component.html',
    styleUrls: ['./code-editor.component.scss'],
})
export class CodeEditorComponent implements OnChanges {
    @Input() title = '';

    @Input() code;

    @Input() path;

    @Output() CodeChange = new EventEmitter<any>();

    public invalidFile: boolean = false;

    public codeStream: string = '';

    constructor(public notificationService: NotificationService) {}

    ngOnChanges(changes: any) {
        if (changes.code?.currentValue !== changes.code?.previousValue) {
            this.JSONToStream(changes.code.currentValue);
        }
    }

    canConvertToJson() {
        return !(
            this.path !== EConfigPath.LABELS &&
            Object.values(EConfigPath).includes(this.path)
        );
    }

    JSONToStream(code) {
        this.codeStream = code;
        if (this.canConvertToJson()) {
            try {
                this.codeStream = JSON.stringify(code, null, 4).trimStart();
                this.invalidFile = false;
            } catch (error) {
                this.invalidFile = true;
            }
        }
    }

    change(event: any) {
        const streamValue = event.target.value;
        let parsedValued = this.code;
        if (this.canConvertToJson()) {
            try {
                parsedValued = JSON.parse(streamValue);
                this.invalidFile = false;
            } catch (error) {
                this.invalidFile = true;
                this.notificationService.sendError(error);
            }
        } else {
            parsedValued = streamValue;
        }
        this.CodeChange.emit(parsedValued);
    }
}
