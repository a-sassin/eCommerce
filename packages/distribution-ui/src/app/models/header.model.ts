export interface HeaderBtnProp {
    text?: string;
    icon?: string;
    id?: string;
    redirUrl?: string;
    color?: string;
    backgroundColor?: string;
    cursor?: string;
    click?: boolean;
    key: string;
}

export interface LogoAndTitle {
    logoImgPath: string;
    titleText: string;
    titleTextColor?: string;
    redirUrl: string;
}

export interface MenuItem {
    key: string;
    text: string;
    id?: string;
    idName?: string;
    redirUrl?: string;
    color?: string;
    click?: boolean;
}
