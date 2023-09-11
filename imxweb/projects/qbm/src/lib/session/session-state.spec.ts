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

import { AuthPropType } from 'imx-api-qbm';
import { SessionState } from './session-state';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('SessionState ', () => {

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should return the uid of the loggedin user', () => {
    const sessionResponse = {
      Status: {
        PrimaryAuth: {
          IsAuthenticated: true,
          Display: 'display',
          Uid: 'uid',
          AuthTime: undefined
        },
        SecondaryAuth: {
          IsAuthenticated: true,
          IsEnabled: false,
          Name: 'Starling'
        }
      }
    };
    const sessionState = new SessionState(sessionResponse);

    expect(sessionState.UserUid).toBe('uid');
  });

  it('should return the name of the loggedin user', () => {
    const sessionResponse = {
      Status: {
        PrimaryAuth: {
          IsAuthenticated: true,
          Display: 'display',
          Uid: 'uid',
          AuthTime: undefined
        },
        SecondaryAuth: {
          IsAuthenticated: true,
          IsEnabled: false,
          Name: 'Starling'
        }
      }
    };
    const sessionState = new SessionState(sessionResponse);

    expect(sessionState.Username).toBe('display');
  });

  [
    {
      AuthProps: undefined,
      expectedIsOAuth: undefined
    },
    {
      AuthProps: [],
      expectedIsOAuth: undefined
    },
    {
      AuthProps: [
        {
          Type: AuthPropType.Password,
          IsMandatory: undefined
        }
      ],
      expectedIsOAuth: undefined
    },
    {
      AuthProps: [
        {
          Type: AuthPropType.OAuth2Code,
          IsMandatory: undefined
        }
      ],
      expectedIsOAuth: true
    }
  ].forEach(testcase =>
    it('maps config', () => {
      const sessionResponse = {
        Config: [
          {
            Name: 'config1',
            Display: 'display1',
            AuthProps: testcase.AuthProps
          }
        ]
      };
      const sessionState = new SessionState(sessionResponse);

      expect(sessionState.configurationProviders.length).toEqual(sessionResponse.Config.length);
      expect(sessionState.configurationProviders[0].isOAuth2).toEqual(testcase.expectedIsOAuth);
    })
  );
});
