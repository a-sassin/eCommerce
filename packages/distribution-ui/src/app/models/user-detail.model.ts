import { TYPE } from '../util/constant';

export const USER_URN = 'urn:ietf:params:scim:schemas:extension:ibm:2.0:User';
export interface UserDetail {
    userName: string;
    phoneNumbers?: [
        {
            type: TYPE.WORK;
            value: string;
        }
    ];
    addresses?: [
        {
            locality: string;
            country: string;
            region: string;
            formatted: string;
            primary: true;
            streetAddress: string;
            postalCode: string;
            type: TYPE.WORK;
        }
    ];
    USER_URN?: {
        customAttributes: [
            {
                values: string[];
                name: string;
            }
        ];
        linkedAccounts?: [
            {
                externalId: string;
                realm: string;
            }
        ];
    };
    displayName: string;
    name: {
        middleName: string;
        givenName: string;
        familyName: string;
        formatted: string;
    };
    emails: [
        {
            type: TYPE.WORK;
            value: string;
        }
    ];
    groups?: [
        {
            displayName: string;
            id: string;
            $ref: string;
        }
    ];
    id: string;
    schemas?: string[];
}

export interface UpdateDetails {
    schemas: string[];
    Operations: Data[];
}

export interface Data {
    op: string;
    path: string;
    value: any;
}

export interface UserLocalData {
    name?: string;
    email?: string;
    isLoggedIn?: boolean;
    userId?: string;
    issuerUrl?: string;
}

export interface UserIdenityMatching {
    firstName: string;
    lastName: string;
}
