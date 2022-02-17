export const USERDATA = 'userdata';
export const PRODUCTDATA = 'productdata';
export const ORDERID = 'orderId';
export const TITLEURL = 'titleURL';
export const DEFAULT_SCCUESS = 'Your profile is saved!';
export const DEFAULT_ERROR = 'Something went wrong';
export const ISDISDIALOGSHOWN = 'isDiscountDialogShown';
export const ISSHOWNCONSENTDIA = 'isShownConsentDailog';

export const CONSENT_SUCCUESS = 'Your consent is saved!';
export const FAILURE = 'failure';

export enum TYPE {
    WORK = 'work',
}

export enum OPERATION {
    REPLACE = 'replace',
    ADD = 'add',
    REMOVE = 'remove',
}

export enum ATTRIBUTE {
    TRANSACTIONID = 'trasnsactionid',
    CARDNUMBER = 'creditCardNumber',
    CARDEXPIRATION = 'creditCardExpiration',
    CREITCARDFULLNAME = 'creditCardFullName',
    ENABLE_MFA = 'enableMfa',
    CREDITCARDTYPE = 'creditCardType',
    BIRTHDAYDATE = 'birthdate',
    PURCHASEDPID = 'purchasedProductId',
    PURCHASEDPTYPE = 'purchasedProductType',
}

export const uniqueAttributes: string[] = [];

export const booleanAttributes: string[] = [
    ATTRIBUTE.TRANSACTIONID,
    ATTRIBUTE.ENABLE_MFA,
];

export const SCHEMAS = ['urn:ietf:params:scim:api:messages:2.0:PatchOp'];

export const VALIDATION_MSSG = 'This field is required with valid';

export enum CARDTYPE {
    AMEX = 'Amex',
    VISA = 'Visa',
}

export enum PURPOSEID {
    MFADISTRIBUTION = 'mfaDetailsDistribution',
    CREDITCARDSTOREDISTRIBUTION = 'storeCreditCardDetailsDistribution',
    COMMUNICATIONDISTRIBUTION = 'communicationDistribution',
    DISTRIBUTIONTERMS = 'terms',
    SHIPPINGDISTRIBUTION = 'shippingDistribution',
    PURCHASEHISTORY = 'purchaseHistory',
}

export enum ITERATE {
    ZERO = 0,
    ONE = 1,
    TWO = 2,
}

export enum STATE {
    ALLOW = 1,
    DENY = 2,
}

export interface ISVError {
    message?: string;
}
