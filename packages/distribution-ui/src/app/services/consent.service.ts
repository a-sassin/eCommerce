import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import environment from 'src/environments/environment';
import { ConsentDescription } from '../models/item.model';
import { OPERATION, STATE } from '../util/constant';
import { AuthService } from './auth.service';

export enum ECONSENTSTYLE {
    HIDE = 1,
    TRANSPARENT = 2,
    IMPLICIT = 'ASSENT_IMPLICIT',
}

@Injectable({
    providedIn: 'root',
})
export class ConsentService {
    constructor(
        private readonly service: AuthService,
        private http: HttpClient
    ) {}

    accessToken = this.service.getUserLocalData()?.data?.accessToken;

    backendUrl = environment.baseUrl;

    public consentDetail: any;

    getConsentDescription(payload: ConsentDescription): Observable<any> {
        return this.http.post<any>(
            `${this.backendUrl}/dpcm/data-subject`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            }
        );
    }

    updateConsent(payload: any): Observable<any> {
        return this.http.patch<any>(
            `${this.backendUrl}/dpcm/data-consents`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            }
        );
    }

    consentApprovalStatus(payload: any): Observable<any> {
        return this.http.post<any>(
            `${this.backendUrl}/dpcm/data-usage`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            }
        );
    }

    updateSignupConsent(payload): Observable<any> {
        const apiAccessToken = this.service.getUserLocalData()?.data
            ?.apiAccessToken;
        return this.http.patch<any>(
            `${this.backendUrl}/dpcm/data-consents`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${apiAccessToken}`,
                },
            }
        );
    }

    addConsentPayload(state, id, consentArray): any {
        const payload = [];

        const filterConsent = consentArray.find(
            option => option.purposeId === id
        );
        if (!filterConsent) {
            return;
        }
        if (!filterConsent.attr) {
            payload.push({
                op: OPERATION.ADD,
                value: {
                    purposeId: filterConsent.purposeId,
                    state: state ? STATE.ALLOW : STATE.DENY,
                    accessTypeId: filterConsent.accessTypeId,
                },
            });
        } else {
            filterConsent.attr.forEach(attr => {
                payload.push({
                    op: OPERATION.ADD,
                    value: {
                        purposeId: filterConsent.purposeId,
                        state: state ? STATE.ALLOW : STATE.DENY,
                        attributeId: attr,
                        accessTypeId: filterConsent.accessTypeId,
                    },
                });
            });
        }

        return payload;
    }

    getAssentImplicit(item, result, consents): any {
        const index = consents.findIndex(
            id => id?.formFieldName === item || id?.purposeId === item
        );
        consents[index] = {
            ...consents[index],
            rule: result?.trace?.rule?.decision,
        };

        return consents;
    }

    getConsentStyles(type: number): string {
        switch (type) {
            case ECONSENTSTYLE.HIDE:
                return 'hide';
            case ECONSENTSTYLE.TRANSPARENT:
                return 'transparent';
            default:
                return '';
        }
    }
}
