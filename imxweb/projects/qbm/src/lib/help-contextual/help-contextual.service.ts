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

import { Injectable } from '@angular/core';
import { ContextualHelpItem } from '@imx-modules/imx-api-qbm';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from '../appConfig/appConfig.service';

/**
 * Contains all the methods for help context.
 */
@Injectable({
  providedIn: 'root',
})
export class HelpContextualService {
  private helpContextId: HelpContextualValues | null;
  constructor(
    private appConfigService: AppConfigService,
    private translateService: TranslateService,
  ) {}

  /**
   * The call returns the selected contextual help item.
   * @param {HelpContextualValues}
   * @returns the selected ContextualHelpItem
   */
  public async getHelpContext(contextId: HelpContextualValues): Promise<ContextualHelpItem> {
    const lang = this.translateService.currentLang === 'de' ? 'de-DE' : this.translateService.currentLang;
    let contextItem: ContextualHelpItem;
    try {
      contextItem = await this.appConfigService.client.imx_help_context_get(contextId, lang);
    } catch (error) {
      contextItem = await this.appConfigService.client.imx_help_context_get(HELP_CONTEXTUAL.Default, lang);
    }
    return contextItem;
  }

  /**
   * The call returns documentation path with the base URL.
   * @param {string} relativeDocumentationPath
   * @returns {string}
   */
  public getHelpLink(relativeDocumentationPath: string): string {
    return `${this.appConfigService.BaseUrl}/${relativeDocumentationPath}`;
  }

  /**
   * The call sets the stored help context ID.
   * @param {HelpContextualValues}
   */
  public setHelpContextId(contextId: HelpContextualValues | null): void {
    this.helpContextId = contextId;
  }

  /**
   * The call returns the stored help context ID.
   * @returns {HelpContextualValues}
   */
  public GetHelpContextId(): HelpContextualValues | null {
    return this.helpContextId;
  }
}

// TODO generate this enum somewhere else. PBI: #422320
/**
 * The constant with all the help contextual keys.
 * Add the value also to the Common\CompositionApi.Server\helpcontext.definitions.json file as uid
 */
export const HELP_CONTEXTUAL = {
  Default: 'default',
  StatisticsPage: 'statistics-page',
  StatisticsFavoritesOrdering: 'statistics-favorites-ordering',
  NewRequest: 'new-request',
  NewRequestRecommendedProduct: 'new-request-recommended-product',
  NewRequestReferenceUser: 'new-request-reference-user',
  NewRequestProductBundle: 'new-request-product-bundle',
  ShoppingCart: 'shopping-cart',
  ShoppingCartEmpty: 'shopping-cart-empty',
  ShoppingCartForLater: 'shopping-cart-for-later',
  PendingRequest: 'pending-request',
  PendingRequestInquiries: 'pending-request-inquiries',
  RequestHistory: 'request-history',
  RequestHistoryAuditor: 'request-history-auditor',
  ArchivedRequest: 'archived-request',
  RequestTemplates: 'request-templates',
  RequestTemplatesUser: 'request-templates-user',
  RequestTemplatesCreate: 'request-templates-create',
  PendingAttestations: 'pending-attestations',
  AttestationHistory: 'attestation-history',
  AttestationRuns: 'attestation-runs',
  AttestationPolicies: 'attestation-policies',
  AttestationPoliciesCreate: 'attestation-policies-create',
  AttestationPoliciesEdit: 'attestation-policies-edit',
  AttestationPreselection: 'attestation-preselection',
  AttestationPreselectionCreate: 'attestation-preselection-create',
  AttestationPreselectionEdit: 'attestation-preselection-edit',
  AttestationPolicyCollections: 'attestation-policy-collections',
  AttestationPolicyCollectionsCreate: 'attestation-policy-collections-create',
  AttestationPolicyCollectionsEdit: 'attestation-policy-collections-edit',
  AttestationMyAttestationCases: 'attestation-my-attestation-cases',
  ClaimDevice: 'claim-device',
  CompanyPolicies: 'company-policies',
  CompliancePolicyViolations: 'compliance-policy-violations',
  ComplianceRules: 'compliance-rules',
  ComplianceRulesViolationsApprove: 'compliance-rules-violations-approve',
  Delegation: 'delegation',
  TeamResponsibilities: 'team-responsibilities',
  ClaimGroup: 'claim-group',
  MyResponsibilities: 'my-responsibilities',
  MyResponsibilitiesApplication: 'my-responsibilities-application',
  MyResponsibilitiesApplicationRoleEntitlements: 'my-responsibilities-application-role-entitlements',
  MyResponsibilitiesIdentities: 'my-responsibilities-identities',
  MyResponsibilitiesQERResource: 'my-responsibilities-qer-resource',
  MyResponsibilitiesQERReuse: 'my-responsibilities-qer-reuse',
  MyResponsibilitiesQERAssign: 'my-responsibilities-qer-assign',
  MyResponsibilitiesQERReuseUS: 'my-responsibilities-qer-reuse-us',
  MyResponsibilitiesAERole: 'my-responsibilities-ae-role',
  MyResponsibilitiesAERoleRoleEntitlements: 'my-responsibilities-ae-role-role-entitlements',
  MyResponsibilitiesDepartment: 'my-responsibilities-department',
  MyResponsibilitiesDepartmentRoleEntitlements: 'my-responsibilities-department-role-entitlements',
  MyResponsibilitiesLocality: 'my-responsibilities-locality',
  MyResponsibilitiesLocalityRoleEntitlements: 'my-responsibilities-locality-role-entitlements',
  MyResponsibilitiesProfitCenter: 'my-responsibilities-profit-center',
  MyResponsibilitiesProfitCenterRoleEntitlements: 'my-responsibilities-profit-center-role-entitlements',
  MyResponsibilitiesBusinessRoles: 'my-responsibilities-business-roles',
  MyResponsibilitiesBusinessRolesRoleEntitlements: 'my-responsibilities-business-roles-role-entitlements',
  MyResponsibilitiesSystemRoles: 'my-responsibilities-system-roles',
  MyResponsibilitiesSystemRolesRoleEntitlements: 'my-responsibilities-system-roles-role-entitlements',
  MyResponsibilitiesGroups: 'my-responsibilities-groups',
  DataExplorer: 'data-explorer',
  DataExplorerIdentities: 'data-explorer-identities',
  DataExplorerAccounts: 'data-explorer-accounts',
  DataExplorerGroups: 'data-explorer-groups',
  DataExplorerDepartment: 'data-explorer-department',
  DataExplorerDepartmentRoleEntitlements: 'data-explorer-department-role-entitlements',
  DataExplorerLocality: 'data-explorer-locality',
  DataExplorerLocalityRoleEntitlements: 'data-explorer-locality-role-entitlements',
  DataExplorerProfitCenter: 'data-explorer-profit-center',
  DataExplorerProfitCenterRoleEntitlements: 'data-explorer-profit-center-role-entitlements',
  DataExplorerBusinessRoles: 'data-explorer-business-roles',
  DataExplorerBusinessRolesRoleEntitlements: 'data-explorer-business-roles-role-entitlements',
  DataExplorerSystemRoles: 'data-explorer-system-roles',
  DataExplorerSystemRolesRoleEntitlements: 'data-explorer-system-roles-role-entitlements',
  DataExplorerQERResource: 'data-explorer-qer-resource',
  DataExplorerQERReuseUS: 'data-explorer-qer-reuse-us',
  DataExplorerQERReuse: 'data-explorer-qer-reuse',
  DataExplorerQERAssign: 'data-explorer-qer-assign',
  DataExplorerAERole: 'data-explorer-ae-role',
  DataExplorerAERoleRoleEntitlements: 'data-explorer-ae-role-role-entitlements',
  Applications: 'applications',
  Statistics: 'statistics',
  PortalDevices: 'portal-devices',
  PortalDevicesCreate: 'portal-devices-create',
  PortalDevicesEdit: 'portal-devices-edit',
  ConfigurationRisk: 'configuration-risk',
  ConfigurationRiskEdit: 'configuration-risk-edit',
  ConfigurationRequests: 'configuration-requests',
  ConfigurationRequestsCreate: 'configuration-requests-create',
  ConfigurationRequestsDetail: 'configuration-requests-detail',
  ConfigurationRequestsShelves: 'configuration-requests-shelves',
  ConfigurationRequestsShelvesCreate: 'configuration-requests-shelves-create',
  ConfigurationRequestsShelvesDetail: 'configuration-requests-shelves-detail',
  ConfigurationRequestsShelvesProduct: 'configuration-requests-shelves-product',
  ConfigurationRequestsAccess: 'configuration-requests-access',
  ServiceCategories: 'service-categories',
  ServiceCategoriesCreate: 'service-categories-create',
  ServiceCategoriesEdit: 'service-categories-edit',
  ServiceItems: 'service-items',
  ServiceItemsEdit: 'service-items-edit',
  ApprovalWorkflowManager: 'approval-workflow-manager',
  ApprovalWorkflowManagerCreate: 'approval-workflow-manager-create',
  ApprovalWorkflowManagerEdit: 'approval-workflow-manager-edit',
  Reports: 'reports',
  ReportsCreate: 'reports-create',
  ReportsEdit: 'reports-edit',
  HelpDeskSupportTickets: 'help-desk-support-tickets',
  HelpDeskSupportTicketsCreate: 'help-desk-support-tickets-create',
  HelpDeskSupportTicketsEdit: 'help-desk-support-tickets-edit',
  Profile: 'profile',
  ProfileMultipleIdentities: 'profile-multiple-identities',
  Addressbook: 'addressbook',
  ProcessingQueue: 'processing-queue',
  GovernedData: 'governed-data',
  GovernedDataOverview: 'governed-data-overview',
  GovernedDataOwnership: 'governed-data-ownership'
} as const;
type ObjectValues<T> = T[keyof T];
export type HelpContextualValues = ObjectValues<typeof HELP_CONTEXTUAL>;
