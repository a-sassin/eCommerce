import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';

export const instructionHeadings = [
    'Onboard an application in ISV',
    'Setup a theme for ISV',
    'Whitelist site URL for ',
    'Create required attributes',
    'Create required policies',
];

@Injectable({
    providedIn: 'root',
})
export class InstructionsService {
    constructor(public configService: ConfigService) {}
}
