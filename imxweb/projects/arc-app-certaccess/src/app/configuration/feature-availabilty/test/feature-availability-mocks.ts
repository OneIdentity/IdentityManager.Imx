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



export class FeatureAvailabilityCommonMocks {

  public static mockBusyService = {
    show: jasmine.createSpy('show'),
    hide: jasmine.createSpy('hide')
  };

  public static mockFeatureSettings = [
    {
      Key: 'QER\\Attestation\\DisplayInSIM',
      Description: 'Specifies whether \'Attestation\' should be shown in the Starling CertAccess web front-end.',
      Value: false
    },
    {
      Key: 'QER\\ITShop\\DisplayInSIM',
      Description: 'Specifies whether the \'IT Shop\' should be shown in the Starling CertAccess Web Portal.',
      Value: false
    }
  ];

  public static mockUpdatedFeatureSettings = [
    {
      Key: 'QER\\Attestation\\DisplayInSIM',
      Description: 'Specifies whether \'Attestation\' should be shown in the Starling CertAccess web front-end.',
      Value: true
    },
    {
      Key: 'QER\\ITShop\\DisplayInSIM',
      Description: 'Specifies whether the \'IT Shop\' should be shown in the Starling CertAccess Web Portal.',
      Value: true
    }
  ];

  public static expectedFeatureSettingUpdateData = {
    'QER\\Attestation\\DisplayInSIM': true,
    'QER\\ITShop\\DisplayInSIM': true
  };

  public static mockFeatureAvailabilityService = {
    updateFeatureSettings: jasmine.createSpy('updateFeatureSettings'),
    getFeatureSettings: jasmine.createSpy('getFeatureSettings').and.returnValue(Promise.resolve([])),
    featureSettings: FeatureAvailabilityCommonMocks.mockFeatureSettings,
    featureSettings$: {
      subscribe: jasmine.createSpy('subscribe').and.returnValue({unsubscribe: jasmine.createSpy('unsubscribe')}),
    }
  };

  public static readonly storage = {};
  public static mockStorageService: any = {
    isHelperAlertDismissed: jasmine.createSpy('isHelperAlertDismissed').and.callFake(
      (key: string) => FeatureAvailabilityCommonMocks.storage[key]),
    storeHelperAlertDismissal: jasmine.createSpy('storeHelperAlertDismissal').and.callFake(
      (key: string) => FeatureAvailabilityCommonMocks.storage[key] = true),
  };
}
