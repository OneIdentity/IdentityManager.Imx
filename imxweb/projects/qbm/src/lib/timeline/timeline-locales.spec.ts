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
 * Copyright 2022 One Identity LLC.
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

import { TimelineLocales } from './timeline-locales';

const testcases = [
    {
        culture: 'en', subcultures: ['US', 'UK'],
        captions: {
            Timeline_ZoomIn: 'Zoom in',
            Timeline_ZoomOut: 'Zoom out',
            Timeline_MoveLeft: 'Move left',
            Timeline_MoveRight: 'Move right',
            Timeline_ClusterDescription: (numOfEvents: any) => `${numOfEvents} events. Zoom in to see the individual events.`,
            Timeline_ClusterTitle: (numOfEvents: any) => `${numOfEvents} events`,
            Timeline_New: 'New',
            Timeline_CreateNewEvent: 'Create new event'
        },
        expected: () => {
            const locales = [];
            locales['en'] = {
              'MONTHS': ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'],
              'MONTHS_SHORT': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              'DAYS': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
              'DAYS_SHORT': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              'ZOOM_IN': 'Zoom in',
              'ZOOM_OUT': 'Zoom out',
              'MOVE_LEFT': 'Move left',
              'MOVE_RIGHT': 'Move right',
              'CLUSTER_DESCRIPTION': numOfEvents => '{0} events. Zoom in to see the individual events.'.replace('{0}', numOfEvents),
              'CLUSTER_TITLE': numOfEvents => '{0} events'.replace('{0}', numOfEvents),
              'NEW': 'New',
              'CREATE_NEW_EVENT': 'Create new event'
            };
            locales['en-US'] = locales['en'];
            locales['en-UK'] = locales['en'];
            return locales;
        }
    },
    {
        culture: 'fr', subcultures: ['FR', 'BE', 'CA'],
        captions: {
            Timeline_ZoomIn: 'Zoomer',
            Timeline_ZoomOut: 'Dézoomer',
            Timeline_MoveLeft: 'Déplacer à gauche',
            Timeline_MoveRight: 'Déplacer à droite',
            Timeline_ClusterDescription: (numOfEvents: any) => `${numOfEvents} ClusterDescription fr`,
            Timeline_ClusterTitle: (numOfEvents: any) => `${numOfEvents} ClusterTitle fr`,
            Timeline_New: 'Nouveau',
            Timeline_CreateNewEvent: 'Créer un nouvel évènement'
        },
        expected: () => {
            const locales = [];
            locales['fr'] = {
            'MONTHS': ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
            'MONTHS_SHORT': ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
            'DAYS': ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
            'DAYS_SHORT': ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
            'ZOOM_IN': 'Zoomer',
            'ZOOM_OUT': 'Dézoomer',
            'MOVE_LEFT': 'Déplacer à gauche',
            'MOVE_RIGHT': 'Déplacer à droite',
            'CLUSTER_DESCRIPTION': numOfEvents => '{0} ClusterDescription fr'.replace('{0}', numOfEvents),
            'CLUSTER_TITLE': numOfEvents => '{0} ClusterTitle fr'.replace('{0}', numOfEvents),
            'NEW': 'Nouveau',
            'CREATE_NEW_EVENT': 'Créer un nouvel évènement'
            };
            locales['fr-FR'] = locales['fr'];
            locales['fr-BE'] = locales['fr'];
            locales['fr-CA'] = locales['fr'];
            return locales;
        }
    }
];

function GetItem(key: string, contents: any) {
    if (key === 'CLUSTER_DESCRIPTION' || key === 'CLUSTER_TITLE') {
        return contents[key](0);
    }

    return contents[key];
}

describe('timeline-locales', () => {
    testcases.forEach(testcase =>
        it(`should return the predefined culture ${testcase.culture}`, () => {
            const culture = TimelineLocales.GetLocale(testcase.culture, testcase.captions);
            testcase.expected().forEach(expectedCulture =>
                Object.keys(expectedCulture).forEach(key => expect(GetItem(key, culture)).toEqual(GetItem(key, expectedCulture)))
            );
        }));
});
