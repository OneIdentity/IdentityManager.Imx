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

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ContextualHelpItem } from 'imx-api-qbm';
import { AppConfigService } from '../appConfig/appConfig.service';

/**
 * Contains all the methods for help context.
 */
@Injectable({
  providedIn: 'root',
})
export class HelpContextualService {
  private helpContextId: HelpContextualValues;
  constructor(private appConfigService: AppConfigService, private translateService: TranslateService) {}

  /**
   * The call returns the selected contextual help item.
   * @param {HelpContextualValues}
   * @returns the selected ContextualHelpItem
   */
  public async getHelpContext(contextId: HelpContextualValues): Promise<ContextualHelpItem> {
    const lang = this.translateService.currentLang;
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
  public setHelpContextId(contextId: HelpContextualValues): void {
    this.helpContextId = contextId;
  }

  /**
   * The call returns the stored help context ID.
   * @returns {HelpContextualValues}
   */
  public GetHelpContextId(): HelpContextualValues {
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
  NewRequest: 'new-request',
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
  MyResponsibilitiesIdentities: 'my-responsibilities-identities',
  MyResponsibilitiesQERResource: 'my-responsibilities-qer-resource',
  MyResponsibilitiesQERReuse: 'my-responsibilities-qer-reuse',
  MyResponsibilitiesQERAssign: 'my-responsibilities-qer-assign',
  MyResponsibilitiesQERReuseUS: 'my-responsibilities-qer-reuse-us',
  MyResponsibilitiesAERole: 'my-responsibilities-ae-role',
  MyResponsibilitiesDepartment: 'my-responsibilities-department',
  MyResponsibilitiesLocality: 'my-responsibilities-locality',
  MyResponsibilitiesProfitCenter: 'my-responsibilities-profit-center',
  MyResponsibilitiesBusinessRoles: 'my-responsibilities-business-roles',
  MyResponsibilitiesSystemRoles: 'my-responsibilities-system-roles',
  MyResponsibilitiesGroups: 'my-responsibilities-groups',
  DataExplorer: 'data-explorer',
  DataExplorerIdentities: 'data-explorer-identities',
  DataExplorerAccounts: 'data-explorer-accounts',
  DataExplorerGroups: 'data-explorer-groups',
  DataExplorerDepartment: 'data-explorer-department',
  DataExplorerLocality: 'data-explorer-locality',
  DataExplorerProfitCenter: 'data-explorer-profit-center',
  DataExplorerBusinessRoles: 'data-explorer-business-roles',
  DataExplorerSystemRoles: 'data-explorer-system-roles',
  DataExplorerQERResource: 'data-explorer-qer-resource',
  DataExplorerQERReuseUS: 'data-explorer-qer-reuse-us',
  DataExplorerQERReuse: 'data-explorer-qer-reuse',
  DataExplorerQERAssign: 'data-explorer-qer-assign',
  DataExplorerAERole: 'data-explorer-ae-role',
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
  Reports: 'reports',
  ReportsCreate: 'reports-create',
  ReportsEdit: 'reports-edit',
  HelpDeskSupportTickets: 'help-desk-support-tickets',
  HelpDeskSupportTicketsCreate: 'help-desk-support-tickets-create',
  HelpDeskSupportTicketsEdit: 'help-desk-support-tickets-edit',
  Profile: 'profile',
  ProfileMultipleIdentities: 'profile-multiple-identities',
  Addressbook: 'addressbook',
} as const;
type ObjectValues<T> = T[keyof T];
export type HelpContextualValues = ObjectValues<typeof HELP_CONTEXTUAL>;
