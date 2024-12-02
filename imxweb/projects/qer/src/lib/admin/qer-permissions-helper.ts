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
 * Copyright 2024 One Identity LLC.
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

// ERROR: change to features

export function isPersonAdmin(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_PersonAdmin') != null;
}
export function isPersonManager(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_PersonManager') != null;
}
export function isStructAdmin(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_StructAdmin') != null;
}
export function isShopAdmin(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_ShopAdmin') != null;
}
export function isRuleAdmin(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_RuleStatistics') != null;
}
export function isRoleAdmin(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_RoleAdmin') != null;
}
export function hasFeatures(features: string[], guardedFeatures: string[]): boolean {
  const guardedFeaturesLower = guardedFeatures.map((feature) => feature.toLocaleLowerCase());
  const featuresLower = features.map((feature) => feature.toLocaleLowerCase());
  return guardedFeaturesLower.every((feature) => featuresLower.includes(feature));
}
export function isRoleStatistics(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_RoleStatistics') != null;
}
export function isResourceAdmin(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_ResourceAdmin') != null;
}
export function isShopStatistics(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_ShopStatistics') != null;
}
export function isStructStatistics(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_StructStatistics') != null;
}
export function isCancelPwO(features: string[]): boolean {
  return features.find((item) => item === 'QER_CancelPwO') != null;
}
export function isPolicyStatistics(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_PolicyStatistics') != null;
}
export function isPAGStatistics(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_PAGStatistics') != null;
}
export function isQERPolicyStatistics(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_QERPolicyStatistics') != null;
}
export function isPersonStatistics(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_PersonStatistics') != null;
}

export function isTSBStatistics(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_TSBStatistics') != null;
}
export function isStatistics(features: string[]): boolean {
  return (
    isRoleStatistics(features) ||
    isRuleAdmin(features) ||
    isShopStatistics(features) ||
    isStructStatistics(features) ||
    isPolicyStatistics(features) ||
    isPAGStatistics(features) ||
    isQERPolicyStatistics(features) ||
    isPersonStatistics(features) ||
    isTSBStatistics(features)
  );
}
export function isHyperviewNavigation(features: string[]): boolean {
  return features.find((item) => item === 'Portal_HyperView_Navigation') != null;
}
export function isAuditor(groups: string[]): boolean {
  return groups.find((item) => item.toUpperCase() === 'VI_4_AUDITING_AUDITOR') != null;
}
