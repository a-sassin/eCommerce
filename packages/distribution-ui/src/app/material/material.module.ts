import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

const MaterialModules = [MatIconModule, MatMenuModule, MatBadgeModule];
@NgModule({
    imports: [MaterialModules],
    exports: [MaterialModules],
})
export class MaterialModule {}
