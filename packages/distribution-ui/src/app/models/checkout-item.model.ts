export interface Button {
    text: string;
    type: string;
}

export interface NavList {
    nav: string;
    url: string;
}

export interface FormLists {
    heading: string;
    list: FormInput[];
}
export interface FormInput {
    label: string;
    fieldName: string;
    placeholder?: string;
    type?: string;
    Optional?: string;
}
