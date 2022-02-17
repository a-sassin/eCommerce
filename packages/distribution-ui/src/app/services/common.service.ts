import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CommonService {
    isEmpty(value: any) {
        if (!value) return true;
        if (Array.isArray(value)) return value.length === 0;
        return Object.keys(value)?.length === 0;
    }

    getCustomAttribute(data: any, key: string): string {
        const attr = data?.filter(
            ele => ele.name.toLowerCase() === key.toLowerCase()
        );
        if (attr?.[0]?.values?.[0] === 'undefined') {
            return '';
        }

        return attr?.[0]?.values?.[0];
    }
}
