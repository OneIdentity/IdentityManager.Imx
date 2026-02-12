import { Injectable } from '@angular/core';
import { DisplayColumns } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class DisplayColumnsService {
    constructor(private translate: TranslateService) {
        // Initialize immediately with current language
        this.updateDisplayColumns();

        // Subscribe to language changes
        this.translate.onLangChange.subscribe(() => {
            this.updateDisplayColumns();
        });
    }

    /** Initializes or updates DisplayColumns with the current translation */
    public updateDisplayColumns(): void {
        DisplayColumns.init((key: string) => this.translate.instant(key));
    }
}
