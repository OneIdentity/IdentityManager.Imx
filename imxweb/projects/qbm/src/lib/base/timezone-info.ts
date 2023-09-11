/*
 * ONE IDENTITY LLC. PROPRIETARY INFORMATION
 *
 * This software is confidential.  One Identity, LLC. or one of its affiliates or
 * subsidiaries, has supplied this software to you under terms of a
 * license agreement, nondisclosure agreement or both.
 *
 * You may not copy, disclose, or use this software except in accordance with
 * those terms.
 *
 *
 * Copyright 2023 One Identity LLC.
 * ALL RIGHTS RESERVED.
 *
 * ONE IDENTITY LLC. MAKES NO REPRESENTATIONS OR
 * WARRANTIES ABOUT THE SUITABILITY OF THE SOFTWARE,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, OR
 * NON-INFRINGEMENT.  ONE IDENTITY LLC. SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING
 * THIS SOFTWARE OR ITS DERIVATIVES.
 *
 */

export class TimezoneInfo {

    public static get(): string {
        const year = 2015; // Falls die Uhrzeit auf dem Client mal überhaupt nicht stimmt.
        let lastDate = null;
        let curTestDate: Date;
        let lastUtcOffset = 0;
        let curUtcOffset: number;
        let dayLightChanges = '';
        let countDayLightChanges = 0;

        // alle Tage des aktuellen Jahres prüfen,
        for (let month = 0; month < 12 && countDayLightChanges < 2; month++) {
            for (let day = 1; day <= 31 && countDayLightChanges < 2; day++) {
                curTestDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

                // man kann den 31 Februar definieren, dann kommt automatisch der 3 März heraus
                // deshalb ignorieren, wenn der Monatstag abweicht
                if (curTestDate.getUTCDate() !== day) {
                    continue;
                }

                curUtcOffset = curTestDate.getTimezoneOffset() * -1;

                if (lastDate != null && curUtcOffset !== lastUtcOffset) {
                    dayLightChanges += year +
                        ',' +
                        (lastDate.getUTCMonth() + 1) +
                        ',' +
                        lastDate.getUTCDate() +
                        ',' +
                        lastUtcOffset +
                        ',' +
                        curUtcOffset +
                        ';';
                    countDayLightChanges++;
                }

                lastDate = curTestDate;
                lastUtcOffset = curUtcOffset;
            }
        }

        // wenn es keine Sommer-/ Winterzeit gibt, dann nur das UTC Offset merken
        return dayLightChanges === '' ? lastUtcOffset + '' : dayLightChanges;
    }
}
