import { Directive, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appMask]',
})
export class MaskDirective {
    @Input() maskName: string;

    @HostListener('input', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        const input = event.target as HTMLInputElement;
        let trimmed = input.value;
        const numbers = [];
        const reg = new RegExp('^[0-9]$');

        if (!reg.test(trimmed.substring(trimmed.length, trimmed.length - 1))) {
            input.value = trimmed.substring(0, trimmed.length - 1);
        } else if (this.maskName === 'patientId') {
            if (trimmed.length > 11) {
                trimmed = trimmed.substring(0, 11);
            }
            trimmed = trimmed.replace(/-/g, '');

            numbers.push(trimmed.substring(0, 2));
            if (trimmed.substring(2, 7) !== '') {
                numbers.push(trimmed.substring(2, 7));
            }
            input.value = numbers.join('-');
        } else if (this.maskName === 'credit-card') {
            let newval = '';
            if (trimmed.length > 19) {
                input.value = trimmed.substring(0, 19);
            } else {
                trimmed = trimmed.replace(/\s/g, '');
                for (let i = 0; i < trimmed.length; i += 1) {
                    if (i % 4 === 0 && i > 0) newval = newval.concat(' ');
                    newval = newval.concat(trimmed[i]);
                }
                input.value = newval;
            }
        } else if (this.maskName === 'security-code') {
            if (trimmed.length > 3) {
                input.value = trimmed.substring(0, 3);
            }
        }
    }
}
