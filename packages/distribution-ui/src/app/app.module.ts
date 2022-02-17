import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { SignupComponent } from './signup/signup.component';
import { DialogComponent } from './common/dialog/dialog.component';
import { MaterialModule } from './material/material.module';
import { AdminModule } from './admin/admin.module';

import { LoadingSpinnerComponent } from './common/loading-spinner/loading-spinner.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccessTokenInterceptor } from './services/token.interceptor.service';
import { NotificationComponent } from './common/Notification/notification.component';
import { DeleteAccountComponent } from './pages/delete-account.component';
import {
    configProviderFactory,
    ConfigService,
} from './services/config.service';
import { MfaOtpComponent } from './account-management/mfa-otp/mfa-otp.component';
import { MfaOptionsComponent } from './account-management/mfa-options/mfa-options.component';
import { MfaConsentComponent } from './account-management/mfa-consent/mfa-consent.component';
import { AccountManagementComponent } from './account-management/account-management.component';
import { UpdateProfileComponent } from './account-management/update-profile/update-profile.component';
import { SocialAccountsComponent } from './account-management/social-accounts/social-accounts.component';
import { PurchaseHistoryComponent } from './account-management/purchase-history/purchase-history.component';
import { CardDetailsComponent } from './account-management/card-details/card-details.component';
import { ConsentComponent } from './account-management/consent/consent.component';
import { ProceedSignupComponent } from './pages/proceed-signup.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { CheckoutItemComponent } from './checkout-item/checkout-item.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { OrderPlacedComponent } from './pages/order-placed.component';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { RedirectLoginComponent } from './pages/redirect-login.component';
import { RedirectComponent } from './redirect/redirect.component';
import { TermsComponent } from './pages/terms/terms.component';
import { AutoFocusDirective } from './custom-directive/auto-focus.directive';
import { MaskDirective } from './custom-directive/mask.directive';
import { CreateAccountConsentsComponent } from './pages/create-account-consents/create-account-consents.component';

@NgModule({
    declarations: [
        AppComponent,
        NotificationComponent,
        HeaderComponent,
        SignupComponent,
        DialogComponent,
        LoadingSpinnerComponent,
        DashboardComponent,
        DeleteAccountComponent,
        MfaOtpComponent,
        MfaOptionsComponent,
        MfaConsentComponent,
        AccountManagementComponent,
        UpdateProfileComponent,
        SocialAccountsComponent,
        PurchaseHistoryComponent,
        CardDetailsComponent,
        ConsentComponent,
        ProceedSignupComponent,
        EmailVerificationComponent,
        CheckoutItemComponent,
        ProductDetailComponent,
        OrderPlacedComponent,
        ShoppingCartComponent,
        RedirectLoginComponent,
        RedirectComponent,
        TermsComponent,
        AutoFocusDirective,
        MaskDirective,
        CreateAccountConsentsComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MaterialModule,
        AdminModule,
        HttpClientModule,
    ],
    providers: [
        Title,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AccessTokenInterceptor,
            multi: true,
        },
        {
            provide: APP_INITIALIZER,
            useFactory: configProviderFactory,
            deps: [ConfigService],
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
