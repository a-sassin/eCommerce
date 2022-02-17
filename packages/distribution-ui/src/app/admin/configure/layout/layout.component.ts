import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import environment from 'src/environments/environment';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
    public logo = {
        file: null,
        preview: `${environment.baseUrl}/assets/images/logo.png`,
    };

    public hero = {
        file: null,
        preview: `${environment.baseUrl}/assets/images/hero.png`,
    };

    public tiles = [
        {
            file: null,
            preview: `${environment.baseUrl}/assets/images/productImages/tile1.png`,
        },

        {
            file: null,
            preview: `${environment.baseUrl}/assets/images/productImages/tile2.png`,
        },

        {
            file: null,
            preview: `${environment.baseUrl}/assets/images/productImages/tile3.png`,
        },

        {
            file: null,
            preview: `${environment.baseUrl}/assets/images/productImages/tile4.png`,
        },

        {
            file: null,
            preview: `${environment.baseUrl}/assets/images/productImages/tile5.png`,
        },

        {
            file: null,
            preview: `${environment.baseUrl}/assets/images/productImages/tile6.png`,
        },

        {
            file: null,
            preview: `${environment.baseUrl}/assets/images/productImages/tile7.png`,
        },

        {
            file: null,
            preview: `${environment.baseUrl}/assets/images/productImages/tile8.png`,
        },
    ];

    public layoutConfigurableKeys: string[] = [];

    constructor(public configService: ConfigService) {}

    ngOnInit(): void {
        this.layoutConfigurableKeys = this.getLayoutConfigurableKeys();
    }

    getLayoutConfigurableKeys() {
        const { config } = this.configService;
        return Object.keys(config).filter(
            (key: any) => config[key].changeLayout !== undefined
        );
    }

    onFileChange = (event: any, imageKind?: string, index?: number) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                if (imageKind) {
                    this[imageKind] = {
                        file,
                        preview: e.target.result,
                    };
                } else {
                    this.tiles[index] = {
                        file,
                        preview: e.target.result,
                    };
                }
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    getTileString(index: number, message?: string) {
        return message ? `${message} tile${index + 1}` : `tile${index + 1}`;
    }

    uploadLogo() {
        this.configService.uploadImage(this.logo.file, 'logo.png');
    }

    uploadHero() {
        this.configService.uploadImage(this.hero.file, 'hero.png');
    }

    uploadtile(tileNumber: number) {
        this.configService.uploadProductImage(
            this.tiles[tileNumber].file,
            `tile${tileNumber + 1}.png`
        );
    }

    saveLayout() {
        this.configService.saveConfig(this.configService.config);
    }
}
