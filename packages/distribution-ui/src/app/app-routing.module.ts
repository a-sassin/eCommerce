import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeleteAccountComponent } from './pages/delete-account.component';
import { AuthGuard } from './guards/auth.guard';
import { MfaConsentComponent } from './account-management/mfa-consent/mfa-consent.component';
import { MfaOptionsComponent } from './account-management/mfa-options/mfa-options.component';
import { MfaOtpComponent } from './account-management/mfa-otp/mfa-otp.component';
import { SignupComponent } from './signup/signup.component';
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

const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

    { path: 'signup', component: SignupComponent },

    { path: 'product-details', component: ProductDetailComponent },

    { path: 'delete-account', component: DeleteAccountComponent },

    { path: 'dashboard', component: DashboardComponent },

    { path: 'signup', component: SignupComponent },

    { path: 'delete-account', component: DeleteAccountComponent },

    { path: 'proceed-signup', component: ProceedSignupComponent },

    { path: 'order-placed', component: OrderPlacedComponent },

    { path: 'confirm-login', component: RedirectLoginComponent },

    { path: 'redirect', component: RedirectComponent },

    {
        path: 'shopping-cart',
        component: ShoppingCartComponent,
    },

    {
        path: 'email-verify',
        component: EmailVerificationComponent,
    },

    {
        path: 'checkout-item',
        component: CheckoutItemComponent,
    },

    {
        path: 'terms',
        component: TermsComponent,
    },

    {
        path: 'admin',
        loadChildren: () =>
            import('./admin/admin.module').then(m => m.AdminModule),
    },

    {
        path: 'account-manage',
        canActivate: [AuthGuard],
        component: AccountManagementComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: UpdateProfileComponent,
            },
            { path: 'mfa-otp', component: MfaOtpComponent },

            { path: 'mfa-methods', component: MfaOptionsComponent },

            { path: 'mfa-consent', component: MfaConsentComponent },
            {
                path: 'social-accounts',
                component: SocialAccountsComponent,
            },
            {
                path: 'consent',
                component: ConsentComponent,
            },
            {
                path: 'purchase-history',
                component: PurchaseHistoryComponent,
            },
            {
                path: 'card-details',
                component: CardDetailsComponent,
            },
        ],
    },

    {
        path: '**',
        redirectTo: '/dashboard',
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            scrollPositionRestoration: 'enabled',
            anchorScrolling: 'enabled',
            scrollOffset: [0, 64],
        }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
