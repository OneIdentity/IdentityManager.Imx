# Web Portal

With the _Web Portal_ users can request and unsubscribe products, and renew products with limited lifetimes. Users can also approve requests and unsubscriptions, perform attestations, view rule violations, and approve or deny exception approvals. Furthermore, users can manage various company resources.
The Web Portal can be categorized into the following parts. 

For more information, refer to the corresponding technical documentation.

## Requests (IT Shop)
The Web Portal allows users to request products. This requests are approved through configurable workflows, that can be combinations of automated processes and user approvals.

## Data management
The main part of data management is handled through the _Data Explorer_ and the _My Responsibilities_ page. The Data Explorer is used by administrators or auditors, the My Responsibilities view is used by managers. The objects that can be handled are determined by the installed dynamic One Identity Manager modules.

## Statistics
Using the _Statistics_ page managers and administrators can look into the statistics. 

## Attestation
Users can manage attestation policies, handle attestation runs and approve the attestation of objects. Attestation is a dynamic library which needs the corresponding One Identity Manager module to be installed.

## 4. Setup
Users can manage shops, service items, service categories, reports and more through the _Setup_ menu.

The following libraries are available. Which libraries are used depends on the configuration of the installation.

|Library name | Description|
|---|---|
| qbm | This is the base library. It contains all base components such as the data table and the column-dependent references. |
| qer | This is the identity management base library. It contains the basic components for identity management such as the Data Explorer.|
| aob | This is the Application Governance library. It contains the components that are needed to manage applications. |
| apc | This is a library that is linked into the Data Explorer. It is used to manage software, that is assigned to users.|
| att | This is the attestation library. It contains everything related to attestation such as attesting objects, manage attestation runs, and so on.|
| cpl | This is the compliance library. It is used to handle rule violations and manage compliance rules. |
| hds | This is the help desk library. It contains components to manage help desk tickets.|
| olg | This is the One Login library. It handles the One Login multi-factor authentication process.|
| pol | This is the company policy library. It is used to handle policy violations and manage company policies.|
| rmb | This is the business role library. It is linked into the Data Explorer and is used to manage business roles. |
| rms | This is the system role library. It is linked into the Data Explorer and is used to manage system roles.|
| rps | This is the report library. It contains components to manage reports. It handles report subscriptions as well.|
| sac | This is the SAP R/3 Compliance add-on module. It adds some SAP features to the request process. |
| tsb | This is the target system library. It is linked into the Data Explorer and is used to manage system entitlements and user accounts from different target systems. |
