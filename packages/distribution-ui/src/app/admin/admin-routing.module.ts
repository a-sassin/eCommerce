import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigureComponent } from './configure/configure.component';
import { CustomizeComponent } from './configure/customize/customize.component';
import { ISVTemplateComponent } from './configure/isv-templates/isv-templates.component';
import { LayoutComponent } from './configure/layout/layout.component';
import { DashboardUiComponent } from './dashboard-ui/dashboard-ui.component';
import { RunSetupComponent } from './setup/run-setup/run-setup.component';
import { SetupInstructionsComponent } from './setup/setup-instructions/setup-instructions.component';
import { SetupComponent } from './setup/setup.component';
import { TenantConfigurationComponent } from './setup/tenant-configuration/tenant-configuration.component';
import { UserIdentitiesComponent } from './setup/user-identities/user-identities.component';
import { ColorPaletteComponent } from './configure/color-palette/color-palette.component';

const routes: Routes = [
    {
        path: '',
        component: DashboardUiComponent,
        children: [
            {
                path: 'setup',
                component: SetupComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'tenant-config',
                    },
                    {
                        path: 'tenant-config',
                        component: TenantConfigurationComponent,
                        pathMatch: 'full',
                    },
                    {
                        path: 'run-setup',
                        component: RunSetupComponent,
                    },
                    {
                        path: 'setup-instructions',
                        component: SetupInstructionsComponent,
                    },
                    {
                        path: 'user-identities',
                        component: UserIdentitiesComponent,
                    },
                ],
            },
            {
                path: 'configure',
                component: ConfigureComponent,
                children: [
                    {
                        path: '',
                        component: LayoutComponent,
                        pathMatch: 'full',
                    },
                    {
                        path: 'customize',
                        component: CustomizeComponent,
                    },
                    {
                        path: 'color-palette',
                        component: ColorPaletteComponent,
                    },
                    {
                        path: 'isv-templates',
                        component: ISVTemplateComponent,
                        children: [
                            {
                                path: ':path',
                                component: ISVTemplateComponent,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        path: '**',
        redirectTo: '',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {}
