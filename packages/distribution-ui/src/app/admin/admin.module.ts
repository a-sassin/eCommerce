import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardUiComponent } from './dashboard-ui/dashboard-ui.component';
import { ConfigureComponent } from './configure/configure.component';
import { LayoutComponent } from './configure/layout/layout.component';
import { MaterialModule } from '../material/material.module';
import { CustomizeComponent } from './configure/customize/customize.component';
import { TenantConfigurationComponent } from './setup/tenant-configuration/tenant-configuration.component';
import { ISVTemplateComponent } from './configure/isv-templates/isv-templates.component';
import { CodeEditorComponent } from './Components/CodeEditor/code-editor.component';
import { UserIdentitiesComponent } from './setup/user-identities/user-identities.component';
import { SetupComponent } from './setup/setup.component';
import { SetupInstructionsComponent } from './setup/setup-instructions/setup-instructions.component';
import { AttributeSetupComponent } from './setup/attributes/attribute-setup.component';
import { RunSetupComponent } from './setup/run-setup/run-setup.component';
import { ThemeSetupComponent } from './setup/theme/theme-setup.component';
import { ColorPaletteComponent } from './configure/color-palette/color-palette.component';

@NgModule({
    declarations: [
        DashboardUiComponent,
        CodeEditorComponent,
        ConfigureComponent,
        LayoutComponent,
        CustomizeComponent,
        TenantConfigurationComponent,
        ISVTemplateComponent,
        UserIdentitiesComponent,
        SetupComponent,
        SetupInstructionsComponent,
        AttributeSetupComponent,
        RunSetupComponent,
        ThemeSetupComponent,
        ColorPaletteComponent,
    ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
    ],
})
export class AdminModule {}
