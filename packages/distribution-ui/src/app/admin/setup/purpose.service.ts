import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ATTRIBUTE, PURPOSEID } from 'src/app/util/constant';
import environment from 'src/environments/environment';

export enum EAccessTypes {
    SHARE = 'share',
    STORE = 'store',
    READ = 'read',
}

export interface IPurposeProps {
    accessTypes: string[];
    attributes: {
        name: string;
        accessTypes: string[];
    }[];
}

export interface IPurposeConfig {
    [key: string]: IPurposeProps;
}

const purposeConfigDist: IPurposeConfig = {
    [PURPOSEID.MFADISTRIBUTION]: {
        accessTypes: [EAccessTypes.READ],
        attributes: [
            {
                name: 'mobile_number',
                accessTypes: [EAccessTypes.READ],
            },
        ],
    },
    [PURPOSEID.SHIPPINGDISTRIBUTION]: {
        accessTypes: [EAccessTypes.STORE],
        attributes: [
            {
                name: 'work_country',
                accessTypes: [EAccessTypes.STORE],
            },
            {
                name: 'work_locality',
                accessTypes: [EAccessTypes.STORE],
            },
            {
                name: 'work_street_address',
                accessTypes: [EAccessTypes.STORE],
            },
            {
                name: 'work_address',
                accessTypes: [EAccessTypes.STORE],
            },
            {
                name: 'work_postalcode',
                accessTypes: [EAccessTypes.STORE],
            },
            {
                name: 'work_region',
                accessTypes: [EAccessTypes.STORE],
            },
        ],
    },

    [PURPOSEID.CREDITCARDSTOREDISTRIBUTION]: {
        accessTypes: [EAccessTypes.STORE],
        attributes: [
            {
                name: ATTRIBUTE.CARDNUMBER,
                accessTypes: [EAccessTypes.STORE],
            },
            {
                name: ATTRIBUTE.CARDEXPIRATION,
                accessTypes: [EAccessTypes.STORE],
            },
            {
                name: ATTRIBUTE.CREITCARDFULLNAME,
                accessTypes: [EAccessTypes.STORE],
            },
            {
                name: ATTRIBUTE.CREDITCARDTYPE,
                accessTypes: [EAccessTypes.STORE],
            },
        ],
    },
    [PURPOSEID.COMMUNICATIONDISTRIBUTION]: {
        accessTypes: [EAccessTypes.READ],
        attributes: [
            {
                name: 'email',
                accessTypes: [EAccessTypes.READ],
            },
        ],
    },
    [PURPOSEID.PURCHASEHISTORY]: {
        accessTypes: [EAccessTypes.SHARE],
        attributes: [
            {
                name: ATTRIBUTE.PURCHASEDPID,
                accessTypes: [EAccessTypes.SHARE],
            },
            {
                name: ATTRIBUTE.PURCHASEDPTYPE,
                accessTypes: [EAccessTypes.SHARE],
            },
        ],
    },
};

const purposeConfigPublic = {};

const purposeConfigHealtcare = {};

@Injectable({
    providedIn: 'root',
})
export class PurposeService {
    public purposeConfig: IPurposeConfig = purposeConfigPublic;

    constructor(private http: HttpClient, private authService: AuthService) {
        if (environment.workflow === 'healthcare') {
            this.purposeConfig = purposeConfigHealtcare;
        } else if (environment.workflow === 'distribution') {
            this.purposeConfig = purposeConfigDist;
        } else {
            this.purposeConfig = purposeConfigPublic;
        }
    }

    public testPurposes() {
        const apiAccessToken = this.authService?.authData?.apiAccessToken;
        const headers: HttpHeaders = new HttpHeaders({
            Authorization: `Bearer ${apiAccessToken}`,
        });
        this.http
            .get('/dpcm-mgmt/config/v1.0/privacy/purposes', { headers })
            .subscribe({
                next: () => {},
                error: () => {},
            });
    }
}
