export interface LoginResponse {
    data: LoginData;
    status: string;
}

export interface LoginData {
    profile: UserDetails;
    accessToken: string;
}

export interface UserDetails {
    id: string;
    displayName: string;
    username: string;
    name: FullUserName;
    email: String[];
}

export interface FullUserName {
    familyName: string;
    givenName: string;
}
