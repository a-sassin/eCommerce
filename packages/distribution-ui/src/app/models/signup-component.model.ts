export interface FormFeildInterface {
    label: string;
    placeholder?: string;
    fieldName: string;
    type?: string;
    readonly?: boolean;
    nooutline?: boolean;
}
export interface ButtonInterface {
    type: string;
    name: string;
}

export interface SignupRequestPayload {
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    address?: string;
}

export enum ESignUpFieldName {
    firstName = 'firstName',
    lastName = 'lastName',
    email = 'email',
    password = 'password',
    confirmPassword = 'confirmPassword',
}

export interface HeaderMessage {
    msg: string;
    btn: ButtonInterface;
}
