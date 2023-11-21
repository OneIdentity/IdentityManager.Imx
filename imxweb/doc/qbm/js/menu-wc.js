'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">
                        <img alt="" class="img-responsive" data-type="custom-logo" data-src="images/oneidentity-logo.png">
                    </a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AdminModule.html" data-type="entity-link" >AdminModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AdminModule-a347238ea7a15f10d64c7669d5ad111e16b120a1fa608ef5ccbb653d45d548885d732570fad7f83cb9e68e540e85fb5189f79949ee036d24852cd0e1f4adcce3"' : 'data-bs-target="#xs-components-links-module-AdminModule-a347238ea7a15f10d64c7669d5ad111e16b120a1fa608ef5ccbb653d45d548885d732570fad7f83cb9e68e540e85fb5189f79949ee036d24852cd0e1f4adcce3"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AdminModule-a347238ea7a15f10d64c7669d5ad111e16b120a1fa608ef5ccbb653d45d548885d732570fad7f83cb9e68e540e85fb5189f79949ee036d24852cd0e1f4adcce3"' :
                                            'id="xs-components-links-module-AdminModule-a347238ea7a15f10d64c7669d5ad111e16b120a1fa608ef5ccbb653d45d548885d732570fad7f83cb9e68e540e85fb5189f79949ee036d24852cd0e1f4adcce3"' }>
                                            <li class="link">
                                                <a href="components/AddConfigSidesheetComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddConfigSidesheetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ApplyConfigSidesheetComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ApplyConfigSidesheetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CacheComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CacheComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConfigComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConfigComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConfigKeyPathComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConfigKeyPathComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConvertConfigSidesheetComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConvertConfigSidesheetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DashboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DeleteConfigSidesheetComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DeleteConfigSidesheetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ListSettingComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ListSettingComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LogDetailsSidesheetComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LogDetailsSidesheetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LogsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LogsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PackagesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PackagesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PluginsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PluginsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SelectValueComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SelectValueComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StatusComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StatusComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SwaggerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SwaggerComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AdminModule-a347238ea7a15f10d64c7669d5ad111e16b120a1fa608ef5ccbb653d45d548885d732570fad7f83cb9e68e540e85fb5189f79949ee036d24852cd0e1f4adcce3"' : 'data-bs-target="#xs-injectables-links-module-AdminModule-a347238ea7a15f10d64c7669d5ad111e16b120a1fa608ef5ccbb653d45d548885d732570fad7f83cb9e68e540e85fb5189f79949ee036d24852cd0e1f4adcce3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AdminModule-a347238ea7a15f10d64c7669d5ad111e16b120a1fa608ef5ccbb653d45d548885d732570fad7f83cb9e68e540e85fb5189f79949ee036d24852cd0e1f4adcce3"' :
                                        'id="xs-injectables-links-module-AdminModule-a347238ea7a15f10d64c7669d5ad111e16b120a1fa608ef5ccbb653d45d548885d732570fad7f83cb9e68e540e85fb5189f79949ee036d24852cd0e1f4adcce3"' }>
                                        <li class="link">
                                            <a href="injectables/ConfigService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConfigService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StatusService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StatusService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthenticationModule.html" data-type="entity-link" >AuthenticationModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthenticationModule-1664891a4838ec8ae4488b9c3726ee6478f14f0d46f9be5e982cca57396e79beae3a29701892ee7e4c6c8ba1a31fb8776593a85c8f63545ac1b10520ede0eb34"' : 'data-bs-target="#xs-injectables-links-module-AuthenticationModule-1664891a4838ec8ae4488b9c3726ee6478f14f0d46f9be5e982cca57396e79beae3a29701892ee7e4c6c8ba1a31fb8776593a85c8f63545ac1b10520ede0eb34"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthenticationModule-1664891a4838ec8ae4488b9c3726ee6478f14f0d46f9be5e982cca57396e79beae3a29701892ee7e4c6c8ba1a31fb8776593a85c8f63545ac1b10520ede0eb34"' :
                                        'id="xs-injectables-links-module-AuthenticationModule-1664891a4838ec8ae4488b9c3726ee6478f14f0d46f9be5e982cca57396e79beae3a29701892ee7e4c6c8ba1a31fb8776593a85c8f63545ac1b10520ede0eb34"' }>
                                        <li class="link">
                                            <a href="injectables/AuthenticationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthenticationService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OAuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OAuthService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AutoCompleteModule.html" data-type="entity-link" >AutoCompleteModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AutoCompleteModule-5ead2424e63247f740e053f01e4890cea498193ffcd607c238b0d6efb8c05e0fa9339338f3e89465f1a92827a23b4569925c356f4d174fb595fc4774e27f23f0"' : 'data-bs-target="#xs-components-links-module-AutoCompleteModule-5ead2424e63247f740e053f01e4890cea498193ffcd607c238b0d6efb8c05e0fa9339338f3e89465f1a92827a23b4569925c356f4d174fb595fc4774e27f23f0"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AutoCompleteModule-5ead2424e63247f740e053f01e4890cea498193ffcd607c238b0d6efb8c05e0fa9339338f3e89465f1a92827a23b4569925c356f4d174fb595fc4774e27f23f0"' :
                                            'id="xs-components-links-module-AutoCompleteModule-5ead2424e63247f740e053f01e4890cea498193ffcd607c238b0d6efb8c05e0fa9339338f3e89465f1a92827a23b4569925c356f4d174fb595fc4774e27f23f0"' }>
                                            <li class="link">
                                                <a href="components/AutoCompleteComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AutoCompleteComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/BulkPropertyEditorModule.html" data-type="entity-link" >BulkPropertyEditorModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-BulkPropertyEditorModule-4ae87f50b5b70d724246c7bf03bdca388e6671435ddab461fb830082adf8d0cb30b40dff36b86af0977896f23703817351c55afd3251749b57168528beb6d07e"' : 'data-bs-target="#xs-components-links-module-BulkPropertyEditorModule-4ae87f50b5b70d724246c7bf03bdca388e6671435ddab461fb830082adf8d0cb30b40dff36b86af0977896f23703817351c55afd3251749b57168528beb6d07e"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-BulkPropertyEditorModule-4ae87f50b5b70d724246c7bf03bdca388e6671435ddab461fb830082adf8d0cb30b40dff36b86af0977896f23703817351c55afd3251749b57168528beb6d07e"' :
                                            'id="xs-components-links-module-BulkPropertyEditorModule-4ae87f50b5b70d724246c7bf03bdca388e6671435ddab461fb830082adf8d0cb30b40dff36b86af0977896f23703817351c55afd3251749b57168528beb6d07e"' }>
                                            <li class="link">
                                                <a href="components/BulkItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BulkItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BulkPropertyEditorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BulkPropertyEditorComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/BusyIndicatorModule.html" data-type="entity-link" >BusyIndicatorModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-BusyIndicatorModule-48884956bac79cf3a8baa08fec32952745fbf845f78dbf4f5aa7c94504db4b2608a6d57ee46898439d623a942f000860bddc6e2bef392eff21d5d44ea3ceef4a"' : 'data-bs-target="#xs-components-links-module-BusyIndicatorModule-48884956bac79cf3a8baa08fec32952745fbf845f78dbf4f5aa7c94504db4b2608a6d57ee46898439d623a942f000860bddc6e2bef392eff21d5d44ea3ceef4a"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-BusyIndicatorModule-48884956bac79cf3a8baa08fec32952745fbf845f78dbf4f5aa7c94504db4b2608a6d57ee46898439d623a942f000860bddc6e2bef392eff21d5d44ea3ceef4a"' :
                                            'id="xs-components-links-module-BusyIndicatorModule-48884956bac79cf3a8baa08fec32952745fbf845f78dbf4f5aa7c94504db4b2608a6d57ee46898439d623a942f000860bddc6e2bef392eff21d5d44ea3ceef4a"' }>
                                            <li class="link">
                                                <a href="components/BusyIndicatorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BusyIndicatorComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/CaptchaModule.html" data-type="entity-link" >CaptchaModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-CaptchaModule-cae4b3c4d78be369599dd2226a26b801e399e6f0511ae6d704409a8bf5f32675d777f0555c25159d05452af57ab99c903a6bc1cbf5ae911b28f63ac9e5523fab"' : 'data-bs-target="#xs-components-links-module-CaptchaModule-cae4b3c4d78be369599dd2226a26b801e399e6f0511ae6d704409a8bf5f32675d777f0555c25159d05452af57ab99c903a6bc1cbf5ae911b28f63ac9e5523fab"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-CaptchaModule-cae4b3c4d78be369599dd2226a26b801e399e6f0511ae6d704409a8bf5f32675d777f0555c25159d05452af57ab99c903a6bc1cbf5ae911b28f63ac9e5523fab"' :
                                            'id="xs-components-links-module-CaptchaModule-cae4b3c4d78be369599dd2226a26b801e399e6f0511ae6d704409a8bf5f32675d777f0555c25159d05452af57ab99c903a6bc1cbf5ae911b28f63ac9e5523fab"' }>
                                            <li class="link">
                                                <a href="components/CaptchaComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CaptchaComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/CdrModule.html" data-type="entity-link" >CdrModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-CdrModule-fb369f0122424f640c7542dec61bf7a44581fb6bca9deb5f4ca76d3291238f273e47ab94ed1e5f1fc48a2f6b40f917e4103b16388f143c7e0ef6df6a4128973e"' : 'data-bs-target="#xs-components-links-module-CdrModule-fb369f0122424f640c7542dec61bf7a44581fb6bca9deb5f4ca76d3291238f273e47ab94ed1e5f1fc48a2f6b40f917e4103b16388f143c7e0ef6df6a4128973e"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-CdrModule-fb369f0122424f640c7542dec61bf7a44581fb6bca9deb5f4ca76d3291238f273e47ab94ed1e5f1fc48a2f6b40f917e4103b16388f143c7e0ef6df6a4128973e"' :
                                            'id="xs-components-links-module-CdrModule-fb369f0122424f640c7542dec61bf7a44581fb6bca9deb5f4ca76d3291238f273e47ab94ed1e5f1fc48a2f6b40f917e4103b16388f143c7e0ef6df6a4128973e"' }>
                                            <li class="link">
                                                <a href="components/CdrEditorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CdrEditorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CdrSidesheetComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CdrSidesheetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DateRangeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DateRangeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditBinaryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditBinaryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditBooleanComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditBooleanComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditDateComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditDateComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditDefaultComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditDefaultComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditFkComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditFkComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditFkMultiComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditFkMultiComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditImageComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditImageComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditLimitedValueComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditLimitedValueComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditMultiLimitedValueComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditMultiLimitedValueComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditMultiValueComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditMultiValueComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditMultilineComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditMultilineComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditNumberComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditNumberComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditRiskIndexComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditRiskIndexComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditUrlComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditUrlComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EntityColumnEditorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EntityColumnEditorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PropertyViewerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PropertyViewerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ViewPropertyComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ViewPropertyComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ViewPropertyDefaultComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ViewPropertyDefaultComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CdrModule-fb369f0122424f640c7542dec61bf7a44581fb6bca9deb5f4ca76d3291238f273e47ab94ed1e5f1fc48a2f6b40f917e4103b16388f143c7e0ef6df6a4128973e"' : 'data-bs-target="#xs-injectables-links-module-CdrModule-fb369f0122424f640c7542dec61bf7a44581fb6bca9deb5f4ca76d3291238f273e47ab94ed1e5f1fc48a2f6b40f917e4103b16388f143c7e0ef6df6a4128973e"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CdrModule-fb369f0122424f640c7542dec61bf7a44581fb6bca9deb5f4ca76d3291238f273e47ab94ed1e5f1fc48a2f6b40f917e4103b16388f143c7e0ef6df6a4128973e"' :
                                        'id="xs-injectables-links-module-CdrModule-fb369f0122424f640c7542dec61bf7a44581fb6bca9deb5f4ca76d3291238f273e47ab94ed1e5f1fc48a2f6b40f917e4103b16388f143c7e0ef6df6a4128973e"' }>
                                        <li class="link">
                                            <a href="injectables/CdrRegistryService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CdrRegistryService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ClassloggerModule.html" data-type="entity-link" >ClassloggerModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ClassloggerModule-98cd349d15da4641461305b9c5804ea9611371cd5e520abb06e830d9097b6780ce85337b7d4fec1edd3bb932b3d409cd01b97b361a49e56db380daa4fc8854b9"' : 'data-bs-target="#xs-injectables-links-module-ClassloggerModule-98cd349d15da4641461305b9c5804ea9611371cd5e520abb06e830d9097b6780ce85337b7d4fec1edd3bb932b3d409cd01b97b361a49e56db380daa4fc8854b9"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ClassloggerModule-98cd349d15da4641461305b9c5804ea9611371cd5e520abb06e830d9097b6780ce85337b7d4fec1edd3bb932b3d409cd01b97b361a49e56db380daa4fc8854b9"' :
                                        'id="xs-injectables-links-module-ClassloggerModule-98cd349d15da4641461305b9c5804ea9611371cd5e520abb06e830d9097b6780ce85337b7d4fec1edd3bb932b3d409cd01b97b361a49e56db380daa4fc8854b9"' }>
                                        <li class="link">
                                            <a href="injectables/ClassloggerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClassloggerService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ConfirmationModule.html" data-type="entity-link" >ConfirmationModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ConfirmationModule-5a1a5eb5026080aa3c8d485de8a55df4efb3d21e6353b28e68fceffbad81ba6955923c5e426bbe04635c5b36c9f831b5cf762f1897db09cc7daaf1d4b6106053"' : 'data-bs-target="#xs-injectables-links-module-ConfirmationModule-5a1a5eb5026080aa3c8d485de8a55df4efb3d21e6353b28e68fceffbad81ba6955923c5e426bbe04635c5b36c9f831b5cf762f1897db09cc7daaf1d4b6106053"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ConfirmationModule-5a1a5eb5026080aa3c8d485de8a55df4efb3d21e6353b28e68fceffbad81ba6955923c5e426bbe04635c5b36c9f831b5cf762f1897db09cc7daaf1d4b6106053"' :
                                        'id="xs-injectables-links-module-ConfirmationModule-5a1a5eb5026080aa3c8d485de8a55df4efb3d21e6353b28e68fceffbad81ba6955923c5e426bbe04635c5b36c9f831b5cf762f1897db09cc7daaf1d4b6106053"' }>
                                        <li class="link">
                                            <a href="injectables/ConfirmationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConfirmationService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CustomThemeModule.html" data-type="entity-link" >CustomThemeModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CustomThemeModule-3977518e50c666c93e9f6a1410f7837ce39d7edca0865e5111b657ac5b9bb2f093b77ad31a75c03c41068022ff476587e85e8b390e07c2d9ddcc1df3897e8642"' : 'data-bs-target="#xs-injectables-links-module-CustomThemeModule-3977518e50c666c93e9f6a1410f7837ce39d7edca0865e5111b657ac5b9bb2f093b77ad31a75c03c41068022ff476587e85e8b390e07c2d9ddcc1df3897e8642"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CustomThemeModule-3977518e50c666c93e9f6a1410f7837ce39d7edca0865e5111b657ac5b9bb2f093b77ad31a75c03c41068022ff476587e85e8b390e07c2d9ddcc1df3897e8642"' :
                                        'id="xs-injectables-links-module-CustomThemeModule-3977518e50c666c93e9f6a1410f7837ce39d7edca0865e5111b657ac5b9bb2f093b77ad31a75c03c41068022ff476587e85e8b390e07c2d9ddcc1df3897e8642"' }>
                                        <li class="link">
                                            <a href="injectables/AppConfigService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppConfigService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DataExportModule.html" data-type="entity-link" >DataExportModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-DataExportModule-ac02a3c5194af6b28cfb2d2860f83ac5cce3e2eb926669dca5736bf48aa9ab2dd3ca069c90baa70fe67f5ded2b289215c5c65014659e7e3e5c1cb88381ce63c3"' : 'data-bs-target="#xs-components-links-module-DataExportModule-ac02a3c5194af6b28cfb2d2860f83ac5cce3e2eb926669dca5736bf48aa9ab2dd3ca069c90baa70fe67f5ded2b289215c5c65014659e7e3e5c1cb88381ce63c3"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DataExportModule-ac02a3c5194af6b28cfb2d2860f83ac5cce3e2eb926669dca5736bf48aa9ab2dd3ca069c90baa70fe67f5ded2b289215c5c65014659e7e3e5c1cb88381ce63c3"' :
                                            'id="xs-components-links-module-DataExportModule-ac02a3c5194af6b28cfb2d2860f83ac5cce3e2eb926669dca5736bf48aa9ab2dd3ca069c90baa70fe67f5ded2b289215c5c65014659e7e3e5c1cb88381ce63c3"' }>
                                            <li class="link">
                                                <a href="components/DataExportComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataExportComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DataSourceToolbarModule.html" data-type="entity-link" >DataSourceToolbarModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-DataSourceToolbarModule-a48abb84b49169d8b9baf3502a883a7472adb9151e0e15458f84b9003a64d5021730558946ad495d4c4648100f80f34615986db38275f726910a1ebea95af4bc"' : 'data-bs-target="#xs-components-links-module-DataSourceToolbarModule-a48abb84b49169d8b9baf3502a883a7472adb9151e0e15458f84b9003a64d5021730558946ad495d4c4648100f80f34615986db38275f726910a1ebea95af4bc"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DataSourceToolbarModule-a48abb84b49169d8b9baf3502a883a7472adb9151e0e15458f84b9003a64d5021730558946ad495d4c4648100f80f34615986db38275f726910a1ebea95af4bc"' :
                                            'id="xs-components-links-module-DataSourceToolbarModule-a48abb84b49169d8b9baf3502a883a7472adb9151e0e15458f84b9003a64d5021730558946ad495d4c4648100f80f34615986db38275f726910a1ebea95af4bc"' }>
                                            <li class="link">
                                                <a href="components/AdditionalInfosComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdditionalInfosComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DataSourcePaginatorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataSourcePaginatorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DataSourceToolbarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataSourceToolbarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DataSourceToolbarCustomComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataSourceToolbarCustomComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FilterTreeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FilterTreeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SaveConfigDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SaveConfigDialogComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DataSourceToolbarModule-a48abb84b49169d8b9baf3502a883a7472adb9151e0e15458f84b9003a64d5021730558946ad495d4c4648100f80f34615986db38275f726910a1ebea95af4bc"' : 'data-bs-target="#xs-injectables-links-module-DataSourceToolbarModule-a48abb84b49169d8b9baf3502a883a7472adb9151e0e15458f84b9003a64d5021730558946ad495d4c4648100f80f34615986db38275f726910a1ebea95af4bc"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DataSourceToolbarModule-a48abb84b49169d8b9baf3502a883a7472adb9151e0e15458f84b9003a64d5021730558946ad495d4c4648100f80f34615986db38275f726910a1ebea95af4bc"' :
                                        'id="xs-injectables-links-module-DataSourceToolbarModule-a48abb84b49169d8b9baf3502a883a7472adb9151e0e15458f84b9003a64d5021730558946ad495d4c4648100f80f34615986db38275f726910a1ebea95af4bc"' }>
                                        <li class="link">
                                            <a href="injectables/AppConfigService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppConfigService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DataTableModule.html" data-type="entity-link" >DataTableModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-DataTableModule-45f723851f710af93173888e6951b6570dc420662f27c8bb4cb60ab298de2662cba4d40d90c1c368c6ed69490ad2af0110bfde69a036d0dfc855841cf8c6d64b"' : 'data-bs-target="#xs-components-links-module-DataTableModule-45f723851f710af93173888e6951b6570dc420662f27c8bb4cb60ab298de2662cba4d40d90c1c368c6ed69490ad2af0110bfde69a036d0dfc855841cf8c6d64b"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DataTableModule-45f723851f710af93173888e6951b6570dc420662f27c8bb4cb60ab298de2662cba4d40d90c1c368c6ed69490ad2af0110bfde69a036d0dfc855841cf8c6d64b"' :
                                            'id="xs-components-links-module-DataTableModule-45f723851f710af93173888e6951b6570dc420662f27c8bb4cb60ab298de2662cba4d40d90c1c368c6ed69490ad2af0110bfde69a036d0dfc855841cf8c6d64b"' }>
                                            <li class="link">
                                                <a href="components/DataTableCellComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataTableCellComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DataTableColumnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataTableColumnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DataTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DataTableDisplayCellComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataTableDisplayCellComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DataTableGenericColumnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataTableGenericColumnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GroupPaginatorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GroupPaginatorComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-DataTableModule-45f723851f710af93173888e6951b6570dc420662f27c8bb4cb60ab298de2662cba4d40d90c1c368c6ed69490ad2af0110bfde69a036d0dfc855841cf8c6d64b"' : 'data-bs-target="#xs-directives-links-module-DataTableModule-45f723851f710af93173888e6951b6570dc420662f27c8bb4cb60ab298de2662cba4d40d90c1c368c6ed69490ad2af0110bfde69a036d0dfc855841cf8c6d64b"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-DataTableModule-45f723851f710af93173888e6951b6570dc420662f27c8bb4cb60ab298de2662cba4d40d90c1c368c6ed69490ad2af0110bfde69a036d0dfc855841cf8c6d64b"' :
                                        'id="xs-directives-links-module-DataTableModule-45f723851f710af93173888e6951b6570dc420662f27c8bb4cb60ab298de2662cba4d40d90c1c368c6ed69490ad2af0110bfde69a036d0dfc855841cf8c6d64b"' }>
                                        <li class="link">
                                            <a href="directives/TableAccessiblilityDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TableAccessiblilityDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#pipes-links-module-DataTableModule-45f723851f710af93173888e6951b6570dc420662f27c8bb4cb60ab298de2662cba4d40d90c1c368c6ed69490ad2af0110bfde69a036d0dfc855841cf8c6d64b"' : 'data-bs-target="#xs-pipes-links-module-DataTableModule-45f723851f710af93173888e6951b6570dc420662f27c8bb4cb60ab298de2662cba4d40d90c1c368c6ed69490ad2af0110bfde69a036d0dfc855841cf8c6d64b"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-DataTableModule-45f723851f710af93173888e6951b6570dc420662f27c8bb4cb60ab298de2662cba4d40d90c1c368c6ed69490ad2af0110bfde69a036d0dfc855841cf8c6d64b"' :
                                            'id="xs-pipes-links-module-DataTableModule-45f723851f710af93173888e6951b6570dc420662f27c8bb4cb60ab298de2662cba4d40d90c1c368c6ed69490ad2af0110bfde69a036d0dfc855841cf8c6d64b"' }>
                                            <li class="link">
                                                <a href="pipes/ExcludedColumnsPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExcludedColumnsPipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DataTilesModule.html" data-type="entity-link" >DataTilesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-DataTilesModule-65f3de7ee87df21f119a384abceb00a6881184744023561f273e055914b6dc7cd58a950d2f3a76a18cf7d016245f3fed929b78d346177d0b5431a8bc16c10a65"' : 'data-bs-target="#xs-components-links-module-DataTilesModule-65f3de7ee87df21f119a384abceb00a6881184744023561f273e055914b6dc7cd58a950d2f3a76a18cf7d016245f3fed929b78d346177d0b5431a8bc16c10a65"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DataTilesModule-65f3de7ee87df21f119a384abceb00a6881184744023561f273e055914b6dc7cd58a950d2f3a76a18cf7d016245f3fed929b78d346177d0b5431a8bc16c10a65"' :
                                            'id="xs-components-links-module-DataTilesModule-65f3de7ee87df21f119a384abceb00a6881184744023561f273e055914b6dc7cd58a950d2f3a76a18cf7d016245f3fed929b78d346177d0b5431a8bc16c10a65"' }>
                                            <li class="link">
                                                <a href="components/DataTileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataTileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DataTilesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataTilesComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DataTreeModule.html" data-type="entity-link" >DataTreeModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-DataTreeModule-887ef3715bf8b3ed4c2bcfbebf721e3a3ba5ae0a667b1e637f31be29bfff4ca6ad6683f55402385986a9a21cb30261f139456b89208edb10e9cb25d14ad2de51"' : 'data-bs-target="#xs-components-links-module-DataTreeModule-887ef3715bf8b3ed4c2bcfbebf721e3a3ba5ae0a667b1e637f31be29bfff4ca6ad6683f55402385986a9a21cb30261f139456b89208edb10e9cb25d14ad2de51"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DataTreeModule-887ef3715bf8b3ed4c2bcfbebf721e3a3ba5ae0a667b1e637f31be29bfff4ca6ad6683f55402385986a9a21cb30261f139456b89208edb10e9cb25d14ad2de51"' :
                                            'id="xs-components-links-module-DataTreeModule-887ef3715bf8b3ed4c2bcfbebf721e3a3ba5ae0a667b1e637f31be29bfff4ca6ad6683f55402385986a9a21cb30261f139456b89208edb10e9cb25d14ad2de51"' }>
                                            <li class="link">
                                                <a href="components/CheckableTreeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CheckableTreeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DataTreeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataTreeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DataTreeSearchResultsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataTreeSearchResultsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TreeSelectionListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TreeSelectionListComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-DataTreeModule-887ef3715bf8b3ed4c2bcfbebf721e3a3ba5ae0a667b1e637f31be29bfff4ca6ad6683f55402385986a9a21cb30261f139456b89208edb10e9cb25d14ad2de51"' : 'data-bs-target="#xs-directives-links-module-DataTreeModule-887ef3715bf8b3ed4c2bcfbebf721e3a3ba5ae0a667b1e637f31be29bfff4ca6ad6683f55402385986a9a21cb30261f139456b89208edb10e9cb25d14ad2de51"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-DataTreeModule-887ef3715bf8b3ed4c2bcfbebf721e3a3ba5ae0a667b1e637f31be29bfff4ca6ad6683f55402385986a9a21cb30261f139456b89208edb10e9cb25d14ad2de51"' :
                                        'id="xs-directives-links-module-DataTreeModule-887ef3715bf8b3ed4c2bcfbebf721e3a3ba5ae0a667b1e637f31be29bfff4ca6ad6683f55402385986a9a21cb30261f139456b89208edb10e9cb25d14ad2de51"' }>
                                        <li class="link">
                                            <a href="directives/MatSelectionListMultipleDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MatSelectionListMultipleDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DataTreeWrapperModule.html" data-type="entity-link" >DataTreeWrapperModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-DataTreeWrapperModule-1a379a5bf87e98f27bb274205f524b488a76dc3dd5901e35015d16a58672d126cbe31194e632882e51d4708d2de83a552fa2c858833e3602f4010fc126063ab5"' : 'data-bs-target="#xs-components-links-module-DataTreeWrapperModule-1a379a5bf87e98f27bb274205f524b488a76dc3dd5901e35015d16a58672d126cbe31194e632882e51d4708d2de83a552fa2c858833e3602f4010fc126063ab5"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DataTreeWrapperModule-1a379a5bf87e98f27bb274205f524b488a76dc3dd5901e35015d16a58672d126cbe31194e632882e51d4708d2de83a552fa2c858833e3602f4010fc126063ab5"' :
                                            'id="xs-components-links-module-DataTreeWrapperModule-1a379a5bf87e98f27bb274205f524b488a76dc3dd5901e35015d16a58672d126cbe31194e632882e51d4708d2de83a552fa2c858833e3602f4010fc126063ab5"' }>
                                            <li class="link">
                                                <a href="components/DataTreeWrapperComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataTreeWrapperComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DateModule.html" data-type="entity-link" >DateModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-DateModule-7ca1547c9d56062b3ac57df81be181bf7b9b8e0b0e7093b56e5b239d548b986478ee4fea0b9226646c752df4482bd656888e635493a33afda96b94b9b90a11dd"' : 'data-bs-target="#xs-components-links-module-DateModule-7ca1547c9d56062b3ac57df81be181bf7b9b8e0b0e7093b56e5b239d548b986478ee4fea0b9226646c752df4482bd656888e635493a33afda96b94b9b90a11dd"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DateModule-7ca1547c9d56062b3ac57df81be181bf7b9b8e0b0e7093b56e5b239d548b986478ee4fea0b9226646c752df4482bd656888e635493a33afda96b94b9b90a11dd"' :
                                            'id="xs-components-links-module-DateModule-7ca1547c9d56062b3ac57df81be181bf7b9b8e0b0e7093b56e5b239d548b986478ee4fea0b9226646c752df4482bd656888e635493a33afda96b94b9b90a11dd"' }>
                                            <li class="link">
                                                <a href="components/CalendarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CalendarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DateComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DateComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TimePickerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TimePickerComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#pipes-links-module-DateModule-7ca1547c9d56062b3ac57df81be181bf7b9b8e0b0e7093b56e5b239d548b986478ee4fea0b9226646c752df4482bd656888e635493a33afda96b94b9b90a11dd"' : 'data-bs-target="#xs-pipes-links-module-DateModule-7ca1547c9d56062b3ac57df81be181bf7b9b8e0b0e7093b56e5b239d548b986478ee4fea0b9226646c752df4482bd656888e635493a33afda96b94b9b90a11dd"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-DateModule-7ca1547c9d56062b3ac57df81be181bf7b9b8e0b0e7093b56e5b239d548b986478ee4fea0b9226646c752df4482bd656888e635493a33afda96b94b9b90a11dd"' :
                                            'id="xs-pipes-links-module-DateModule-7ca1547c9d56062b3ac57df81be181bf7b9b8e0b0e7093b56e5b239d548b986478ee4fea0b9226646c752df4482bd656888e635493a33afda96b94b9b90a11dd"' }>
                                            <li class="link">
                                                <a href="pipes/LocalizedDatePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LocalizedDatePipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/ShortDatePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ShortDatePipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DisableControlModule.html" data-type="entity-link" >DisableControlModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-DisableControlModule-5e9c2d3ba0fd516d22ee1f9516de89f19aad258da87afe309f84b5a55e90af8cd0d001d9cabbff284957e3b578e2277e1dd623d4fe5c8c6a43eeee3644f99b06"' : 'data-bs-target="#xs-directives-links-module-DisableControlModule-5e9c2d3ba0fd516d22ee1f9516de89f19aad258da87afe309f84b5a55e90af8cd0d001d9cabbff284957e3b578e2277e1dd623d4fe5c8c6a43eeee3644f99b06"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-DisableControlModule-5e9c2d3ba0fd516d22ee1f9516de89f19aad258da87afe309f84b5a55e90af8cd0d001d9cabbff284957e3b578e2277e1dd623d4fe5c8c6a43eeee3644f99b06"' :
                                        'id="xs-directives-links-module-DisableControlModule-5e9c2d3ba0fd516d22ee1f9516de89f19aad258da87afe309f84b5a55e90af8cd0d001d9cabbff284957e3b578e2277e1dd623d4fe5c8c6a43eeee3644f99b06"' }>
                                        <li class="link">
                                            <a href="directives/DisableControlDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DisableControlDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DynamicTabsModule.html" data-type="entity-link" >DynamicTabsModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-DynamicTabsModule-b9a7c2515bc80e8e158e65bc6b21a21df481dc56b8132aec0004c2b3d71f36d8cd7a4bbdf5a6faff3813fc2434b9607770e427cabddb4f243e36a1da34cb945c"' : 'data-bs-target="#xs-directives-links-module-DynamicTabsModule-b9a7c2515bc80e8e158e65bc6b21a21df481dc56b8132aec0004c2b3d71f36d8cd7a4bbdf5a6faff3813fc2434b9607770e427cabddb4f243e36a1da34cb945c"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-DynamicTabsModule-b9a7c2515bc80e8e158e65bc6b21a21df481dc56b8132aec0004c2b3d71f36d8cd7a4bbdf5a6faff3813fc2434b9607770e427cabddb4f243e36a1da34cb945c"' :
                                        'id="xs-directives-links-module-DynamicTabsModule-b9a7c2515bc80e8e158e65bc6b21a21df481dc56b8132aec0004c2b3d71f36d8cd7a4bbdf5a6faff3813fc2434b9607770e427cabddb4f243e36a1da34cb945c"' }>
                                        <li class="link">
                                            <a href="directives/DynamicTabDataProviderDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DynamicTabDataProviderDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EntityModule.html" data-type="entity-link" >EntityModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-EntityModule-1349d4cf8e3026ad3cc6e34cd916e26492970d647b1af2e9826e501328a5db0379e44d4feaf7a0aebd37f0614fb7fa4e41da9baf6853d260faae1f54a4625c54"' : 'data-bs-target="#xs-components-links-module-EntityModule-1349d4cf8e3026ad3cc6e34cd916e26492970d647b1af2e9826e501328a5db0379e44d4feaf7a0aebd37f0614fb7fa4e41da9baf6853d260faae1f54a4625c54"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-EntityModule-1349d4cf8e3026ad3cc6e34cd916e26492970d647b1af2e9826e501328a5db0379e44d4feaf7a0aebd37f0614fb7fa4e41da9baf6853d260faae1f54a4625c54"' :
                                            'id="xs-components-links-module-EntityModule-1349d4cf8e3026ad3cc6e34cd916e26492970d647b1af2e9826e501328a5db0379e44d4feaf7a0aebd37f0614fb7fa4e41da9baf6853d260faae1f54a4625c54"' }>
                                            <li class="link">
                                                <a href="components/EntitySelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EntitySelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FkTableSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FkTableSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TypedEntityCandidateSidesheetComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TypedEntityCandidateSidesheetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TypedEntitySelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TypedEntitySelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TypedEntitySelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TypedEntitySelectorComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EntityModule-1349d4cf8e3026ad3cc6e34cd916e26492970d647b1af2e9826e501328a5db0379e44d4feaf7a0aebd37f0614fb7fa4e41da9baf6853d260faae1f54a4625c54"' : 'data-bs-target="#xs-injectables-links-module-EntityModule-1349d4cf8e3026ad3cc6e34cd916e26492970d647b1af2e9826e501328a5db0379e44d4feaf7a0aebd37f0614fb7fa4e41da9baf6853d260faae1f54a4625c54"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EntityModule-1349d4cf8e3026ad3cc6e34cd916e26492970d647b1af2e9826e501328a5db0379e44d4feaf7a0aebd37f0614fb7fa4e41da9baf6853d260faae1f54a4625c54"' :
                                        'id="xs-injectables-links-module-EntityModule-1349d4cf8e3026ad3cc6e34cd916e26492970d647b1af2e9826e501328a5db0379e44d4feaf7a0aebd37f0614fb7fa4e41da9baf6853d260faae1f54a4625c54"' }>
                                        <li class="link">
                                            <a href="injectables/EntityService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EntityService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ExtModule.html" data-type="entity-link" >ExtModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-ExtModule-3d93abf48fe421c4262b1b79d20172735160d86578e8d249915a6497d7862547970ff41a4085b00fbe5d68e9edcd60078459acd072b1a7443d2ba95da354d2df"' : 'data-bs-target="#xs-components-links-module-ExtModule-3d93abf48fe421c4262b1b79d20172735160d86578e8d249915a6497d7862547970ff41a4085b00fbe5d68e9edcd60078459acd072b1a7443d2ba95da354d2df"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ExtModule-3d93abf48fe421c4262b1b79d20172735160d86578e8d249915a6497d7862547970ff41a4085b00fbe5d68e9edcd60078459acd072b1a7443d2ba95da354d2df"' :
                                            'id="xs-components-links-module-ExtModule-3d93abf48fe421c4262b1b79d20172735160d86578e8d249915a6497d7862547970ff41a4085b00fbe5d68e9edcd60078459acd072b1a7443d2ba95da354d2df"' }>
                                            <li class="link">
                                                <a href="components/ExtComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExtComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-ExtModule-3d93abf48fe421c4262b1b79d20172735160d86578e8d249915a6497d7862547970ff41a4085b00fbe5d68e9edcd60078459acd072b1a7443d2ba95da354d2df"' : 'data-bs-target="#xs-directives-links-module-ExtModule-3d93abf48fe421c4262b1b79d20172735160d86578e8d249915a6497d7862547970ff41a4085b00fbe5d68e9edcd60078459acd072b1a7443d2ba95da354d2df"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-ExtModule-3d93abf48fe421c4262b1b79d20172735160d86578e8d249915a6497d7862547970ff41a4085b00fbe5d68e9edcd60078459acd072b1a7443d2ba95da354d2df"' :
                                        'id="xs-directives-links-module-ExtModule-3d93abf48fe421c4262b1b79d20172735160d86578e8d249915a6497d7862547970ff41a4085b00fbe5d68e9edcd60078459acd072b1a7443d2ba95da354d2df"' }>
                                        <li class="link">
                                            <a href="directives/ExtDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExtDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ExtModule-3d93abf48fe421c4262b1b79d20172735160d86578e8d249915a6497d7862547970ff41a4085b00fbe5d68e9edcd60078459acd072b1a7443d2ba95da354d2df"' : 'data-bs-target="#xs-injectables-links-module-ExtModule-3d93abf48fe421c4262b1b79d20172735160d86578e8d249915a6497d7862547970ff41a4085b00fbe5d68e9edcd60078459acd072b1a7443d2ba95da354d2df"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ExtModule-3d93abf48fe421c4262b1b79d20172735160d86578e8d249915a6497d7862547970ff41a4085b00fbe5d68e9edcd60078459acd072b1a7443d2ba95da354d2df"' :
                                        'id="xs-injectables-links-module-ExtModule-3d93abf48fe421c4262b1b79d20172735160d86578e8d249915a6497d7862547970ff41a4085b00fbe5d68e9edcd60078459acd072b1a7443d2ba95da354d2df"' }>
                                        <li class="link">
                                            <a href="injectables/ExtService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExtService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/FilterWizardModule.html" data-type="entity-link" >FilterWizardModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-FilterWizardModule-c5dab5111122d09588a59d55f946833a430dea599088db6c99e69de51901e58404fc40f653fe3e379d5733f1c0495b5301645dc57b0cc96edbabb2b00008ade7"' : 'data-bs-target="#xs-components-links-module-FilterWizardModule-c5dab5111122d09588a59d55f946833a430dea599088db6c99e69de51901e58404fc40f653fe3e379d5733f1c0495b5301645dc57b0cc96edbabb2b00008ade7"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-FilterWizardModule-c5dab5111122d09588a59d55f946833a430dea599088db6c99e69de51901e58404fc40f653fe3e379d5733f1c0495b5301645dc57b0cc96edbabb2b00008ade7"' :
                                            'id="xs-components-links-module-FilterWizardModule-c5dab5111122d09588a59d55f946833a430dea599088db6c99e69de51901e58404fc40f653fe3e379d5733f1c0495b5301645dc57b0cc96edbabb2b00008ade7"' }>
                                            <li class="link">
                                                <a href="components/FilterWizardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FilterWizardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PredefinedFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PredefinedFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PredefinedFilterTreeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PredefinedFilterTreeComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/FkAdvancedPickerModule.html" data-type="entity-link" >FkAdvancedPickerModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-FkAdvancedPickerModule-cac1e0f477cbbbfd8596812db16fe382ff0ae58bfae3fba0ebf8b5c8cd7445bcc4500ca8c1a4bf0e9a95a2820c54e2d0b2373d777b14b735d2b365be9d22ddc4"' : 'data-bs-target="#xs-components-links-module-FkAdvancedPickerModule-cac1e0f477cbbbfd8596812db16fe382ff0ae58bfae3fba0ebf8b5c8cd7445bcc4500ca8c1a4bf0e9a95a2820c54e2d0b2373d777b14b735d2b365be9d22ddc4"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-FkAdvancedPickerModule-cac1e0f477cbbbfd8596812db16fe382ff0ae58bfae3fba0ebf8b5c8cd7445bcc4500ca8c1a4bf0e9a95a2820c54e2d0b2373d777b14b735d2b365be9d22ddc4"' :
                                            'id="xs-components-links-module-FkAdvancedPickerModule-cac1e0f477cbbbfd8596812db16fe382ff0ae58bfae3fba0ebf8b5c8cd7445bcc4500ca8c1a4bf0e9a95a2820c54e2d0b2373d777b14b735d2b365be9d22ddc4"' }>
                                            <li class="link">
                                                <a href="components/FkAdvancedPickerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FkAdvancedPickerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FkCandidatesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FkCandidatesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FkSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FkSelectorComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/FkHierarchicalDialogModule.html" data-type="entity-link" >FkHierarchicalDialogModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-FkHierarchicalDialogModule-3147008fac77ca129e1a6d437cd086d527855c2aa1c51997b68b671cff30d06bdf8c025e518e7c1b56a04cf89b6a1fbd392a6f27018b315f2d4635b1dae15563"' : 'data-bs-target="#xs-components-links-module-FkHierarchicalDialogModule-3147008fac77ca129e1a6d437cd086d527855c2aa1c51997b68b671cff30d06bdf8c025e518e7c1b56a04cf89b6a1fbd392a6f27018b315f2d4635b1dae15563"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-FkHierarchicalDialogModule-3147008fac77ca129e1a6d437cd086d527855c2aa1c51997b68b671cff30d06bdf8c025e518e7c1b56a04cf89b6a1fbd392a6f27018b315f2d4635b1dae15563"' :
                                            'id="xs-components-links-module-FkHierarchicalDialogModule-3147008fac77ca129e1a6d437cd086d527855c2aa1c51997b68b671cff30d06bdf8c025e518e7c1b56a04cf89b6a1fbd392a6f27018b315f2d4635b1dae15563"' }>
                                            <li class="link">
                                                <a href="components/FkHierarchicalDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FkHierarchicalDialogComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/HelpContextualModule.html" data-type="entity-link" >HelpContextualModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-HelpContextualModule-22af5cbb2dbb059b20eafd0d02b779526f021173f74c7b35a268387045647739d7ec3210f94caaef6a20b6a62a5889a7e99ff94b50c64bb261c866bb31f99cff"' : 'data-bs-target="#xs-components-links-module-HelpContextualModule-22af5cbb2dbb059b20eafd0d02b779526f021173f74c7b35a268387045647739d7ec3210f94caaef6a20b6a62a5889a7e99ff94b50c64bb261c866bb31f99cff"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-HelpContextualModule-22af5cbb2dbb059b20eafd0d02b779526f021173f74c7b35a268387045647739d7ec3210f94caaef6a20b6a62a5889a7e99ff94b50c64bb261c866bb31f99cff"' :
                                            'id="xs-components-links-module-HelpContextualModule-22af5cbb2dbb059b20eafd0d02b779526f021173f74c7b35a268387045647739d7ec3210f94caaef6a20b6a62a5889a7e99ff94b50c64bb261c866bb31f99cff"' }>
                                            <li class="link">
                                                <a href="components/HelpContextualComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HelpContextualComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HelpContextualDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HelpContextualDialogComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/HyperViewModule.html" data-type="entity-link" >HyperViewModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-HyperViewModule-c73fde8a31a97517af820187ea2f3a8973ccc4f0e6067fad5869cdd6b9dde743b4b80964c1db217d50a4a26e880f7da984916dc2640ceee47947f550487169d4"' : 'data-bs-target="#xs-components-links-module-HyperViewModule-c73fde8a31a97517af820187ea2f3a8973ccc4f0e6067fad5869cdd6b9dde743b4b80964c1db217d50a4a26e880f7da984916dc2640ceee47947f550487169d4"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-HyperViewModule-c73fde8a31a97517af820187ea2f3a8973ccc4f0e6067fad5869cdd6b9dde743b4b80964c1db217d50a4a26e880f7da984916dc2640ceee47947f550487169d4"' :
                                            'id="xs-components-links-module-HyperViewModule-c73fde8a31a97517af820187ea2f3a8973ccc4f0e6067fad5869cdd6b9dde743b4b80964c1db217d50a4a26e880f7da984916dc2640ceee47947f550487169d4"' }>
                                            <li class="link">
                                                <a href="components/HyperviewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HyperviewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ListShapeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ListShapeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PropertyShapeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PropertyShapeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ShapeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ShapeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SimpleShapeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SimpleShapeComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-HyperViewModule-c73fde8a31a97517af820187ea2f3a8973ccc4f0e6067fad5869cdd6b9dde743b4b80964c1db217d50a4a26e880f7da984916dc2640ceee47947f550487169d4"' : 'data-bs-target="#xs-directives-links-module-HyperViewModule-c73fde8a31a97517af820187ea2f3a8973ccc4f0e6067fad5869cdd6b9dde743b4b80964c1db217d50a4a26e880f7da984916dc2640ceee47947f550487169d4"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-HyperViewModule-c73fde8a31a97517af820187ea2f3a8973ccc4f0e6067fad5869cdd6b9dde743b4b80964c1db217d50a4a26e880f7da984916dc2640ceee47947f550487169d4"' :
                                        'id="xs-directives-links-module-HyperViewModule-c73fde8a31a97517af820187ea2f3a8973ccc4f0e6067fad5869cdd6b9dde743b4b80964c1db217d50a4a26e880f7da984916dc2640ceee47947f550487169d4"' }>
                                        <li class="link">
                                            <a href="directives/ZoomPanDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ZoomPanDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ImageModule.html" data-type="entity-link" >ImageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-ImageModule-32d91a802efcf1ac5b42658a739bba39a23e019de8130852bd11cc83ac88809b548767f6406c44639aa782bbbe5a39c46f8fbe299c031267852248704ccd6fbf"' : 'data-bs-target="#xs-components-links-module-ImageModule-32d91a802efcf1ac5b42658a739bba39a23e019de8130852bd11cc83ac88809b548767f6406c44639aa782bbbe5a39c46f8fbe299c031267852248704ccd6fbf"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ImageModule-32d91a802efcf1ac5b42658a739bba39a23e019de8130852bd11cc83ac88809b548767f6406c44639aa782bbbe5a39c46f8fbe299c031267852248704ccd6fbf"' :
                                            'id="xs-components-links-module-ImageModule-32d91a802efcf1ac5b42658a739bba39a23e019de8130852bd11cc83ac88809b548767f6406c44639aa782bbbe5a39c46f8fbe299c031267852248704ccd6fbf"' }>
                                            <li class="link">
                                                <a href="components/ImageSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImageSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImageViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImageViewComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/InfoModalDialogModule.html" data-type="entity-link" >InfoModalDialogModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-InfoModalDialogModule-05600dcbd777798d495e92d340e8406927e795c64055406e623ce6008ff311cf374066589e144a8d3527f8aabe30064ae7eebae216ca1efc423cf7c9486f5b55"' : 'data-bs-target="#xs-components-links-module-InfoModalDialogModule-05600dcbd777798d495e92d340e8406927e795c64055406e623ce6008ff311cf374066589e144a8d3527f8aabe30064ae7eebae216ca1efc423cf7c9486f5b55"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-InfoModalDialogModule-05600dcbd777798d495e92d340e8406927e795c64055406e623ce6008ff311cf374066589e144a8d3527f8aabe30064ae7eebae216ca1efc423cf7c9486f5b55"' :
                                            'id="xs-components-links-module-InfoModalDialogModule-05600dcbd777798d495e92d340e8406927e795c64055406e623ce6008ff311cf374066589e144a8d3527f8aabe30064ae7eebae216ca1efc423cf7c9486f5b55"' }>
                                            <li class="link">
                                                <a href="components/InfoBadgeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InfoBadgeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InfoButtonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InfoButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InfoDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InfoDialogComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/JobQueueOverviewModule.html" data-type="entity-link" >JobQueueOverviewModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-JobQueueOverviewModule-63c5659fda9fe51c27eddbc0a2b03040d93d3d4a944e77996c3f7a1eccd8a81a120ab0ecac7535d9f542d7a29fe47627425bbdd70b029ab25925aae0278d6809"' : 'data-bs-target="#xs-components-links-module-JobQueueOverviewModule-63c5659fda9fe51c27eddbc0a2b03040d93d3d4a944e77996c3f7a1eccd8a81a120ab0ecac7535d9f542d7a29fe47627425bbdd70b029ab25925aae0278d6809"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-JobQueueOverviewModule-63c5659fda9fe51c27eddbc0a2b03040d93d3d4a944e77996c3f7a1eccd8a81a120ab0ecac7535d9f542d7a29fe47627425bbdd70b029ab25925aae0278d6809"' :
                                            'id="xs-components-links-module-JobQueueOverviewModule-63c5659fda9fe51c27eddbc0a2b03040d93d3d4a944e77996c3f7a1eccd8a81a120ab0ecac7535d9f542d7a29fe47627425bbdd70b029ab25925aae0278d6809"' }>
                                            <li class="link">
                                                <a href="components/JobQueueOverviewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JobQueueOverviewComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-JobQueueOverviewModule-63c5659fda9fe51c27eddbc0a2b03040d93d3d4a944e77996c3f7a1eccd8a81a120ab0ecac7535d9f542d7a29fe47627425bbdd70b029ab25925aae0278d6809"' : 'data-bs-target="#xs-injectables-links-module-JobQueueOverviewModule-63c5659fda9fe51c27eddbc0a2b03040d93d3d4a944e77996c3f7a1eccd8a81a120ab0ecac7535d9f542d7a29fe47627425bbdd70b029ab25925aae0278d6809"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-JobQueueOverviewModule-63c5659fda9fe51c27eddbc0a2b03040d93d3d4a944e77996c3f7a1eccd8a81a120ab0ecac7535d9f542d7a29fe47627425bbdd70b029ab25925aae0278d6809"' :
                                        'id="xs-injectables-links-module-JobQueueOverviewModule-63c5659fda9fe51c27eddbc0a2b03040d93d3d4a944e77996c3f7a1eccd8a81a120ab0ecac7535d9f542d7a29fe47627425bbdd70b029ab25925aae0278d6809"' }>
                                        <li class="link">
                                            <a href="injectables/AppConfigService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppConfigService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JobQueueOverviewService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JobQueueOverviewService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/imx_SessionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >imx_SessionService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/LdsReplaceModule.html" data-type="entity-link" >LdsReplaceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#pipes-links-module-LdsReplaceModule-47050fbcd23961cdebbbced88500435e9af3a5c2bd99c0fd3a8cf2b5187e81f459ae8ff13e04c0eb1f580f2014cf7206bdfb8a188d2c9a2de94ed537dbbf5d2f"' : 'data-bs-target="#xs-pipes-links-module-LdsReplaceModule-47050fbcd23961cdebbbced88500435e9af3a5c2bd99c0fd3a8cf2b5187e81f459ae8ff13e04c0eb1f580f2014cf7206bdfb8a188d2c9a2de94ed537dbbf5d2f"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-LdsReplaceModule-47050fbcd23961cdebbbced88500435e9af3a5c2bd99c0fd3a8cf2b5187e81f459ae8ff13e04c0eb1f580f2014cf7206bdfb8a188d2c9a2de94ed537dbbf5d2f"' :
                                            'id="xs-pipes-links-module-LdsReplaceModule-47050fbcd23961cdebbbced88500435e9af3a5c2bd99c0fd3a8cf2b5187e81f459ae8ff13e04c0eb1f580f2014cf7206bdfb8a188d2c9a2de94ed537dbbf5d2f"' }>
                                            <li class="link">
                                                <a href="pipes/LdsReplacePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LdsReplacePipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/MastHeadModule.html" data-type="entity-link" >MastHeadModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-MastHeadModule-5c206e5c3d4993d53682c6e1d80ef3f0b78d5564b78ad412f2fc91131c6098109acb0e46d94d994c03ab1e8c6482dbc384384e8bb826ae97e100f9300e2e0fbb"' : 'data-bs-target="#xs-components-links-module-MastHeadModule-5c206e5c3d4993d53682c6e1d80ef3f0b78d5564b78ad412f2fc91131c6098109acb0e46d94d994c03ab1e8c6482dbc384384e8bb826ae97e100f9300e2e0fbb"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-MastHeadModule-5c206e5c3d4993d53682c6e1d80ef3f0b78d5564b78ad412f2fc91131c6098109acb0e46d94d994c03ab1e8c6482dbc384384e8bb826ae97e100f9300e2e0fbb"' :
                                            'id="xs-components-links-module-MastHeadModule-5c206e5c3d4993d53682c6e1d80ef3f0b78d5564b78ad412f2fc91131c6098109acb0e46d94d994c03ab1e8c6482dbc384384e8bb826ae97e100f9300e2e0fbb"' }>
                                            <li class="link">
                                                <a href="components/MastHeadComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MastHeadComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MastHeadModule-5c206e5c3d4993d53682c6e1d80ef3f0b78d5564b78ad412f2fc91131c6098109acb0e46d94d994c03ab1e8c6482dbc384384e8bb826ae97e100f9300e2e0fbb"' : 'data-bs-target="#xs-injectables-links-module-MastHeadModule-5c206e5c3d4993d53682c6e1d80ef3f0b78d5564b78ad412f2fc91131c6098109acb0e46d94d994c03ab1e8c6482dbc384384e8bb826ae97e100f9300e2e0fbb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MastHeadModule-5c206e5c3d4993d53682c6e1d80ef3f0b78d5564b78ad412f2fc91131c6098109acb0e46d94d994c03ab1e8c6482dbc384384e8bb826ae97e100f9300e2e0fbb"' :
                                        'id="xs-injectables-links-module-MastHeadModule-5c206e5c3d4993d53682c6e1d80ef3f0b78d5564b78ad412f2fc91131c6098109acb0e46d94d994c03ab1e8c6482dbc384384e8bb826ae97e100f9300e2e0fbb"' }>
                                        <li class="link">
                                            <a href="injectables/MastHeadService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MastHeadService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MenuModule.html" data-type="entity-link" >MenuModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-MenuModule-d6abf8685ca7377afeb1f545d1e431dcf55fd30e2b0e16e00151d0ebee74510e94ec9c27f6e9c91378666139635f13cc61c7914c764dc57cf67c8183c8b0e388"' : 'data-bs-target="#xs-components-links-module-MenuModule-d6abf8685ca7377afeb1f545d1e431dcf55fd30e2b0e16e00151d0ebee74510e94ec9c27f6e9c91378666139635f13cc61c7914c764dc57cf67c8183c8b0e388"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-MenuModule-d6abf8685ca7377afeb1f545d1e431dcf55fd30e2b0e16e00151d0ebee74510e94ec9c27f6e9c91378666139635f13cc61c7914c764dc57cf67c8183c8b0e388"' :
                                            'id="xs-components-links-module-MenuModule-d6abf8685ca7377afeb1f545d1e431dcf55fd30e2b0e16e00151d0ebee74510e94ec9c27f6e9c91378666139635f13cc61c7914c764dc57cf67c8183c8b0e388"' }>
                                            <li class="link">
                                                <a href="components/MenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MenuModule-d6abf8685ca7377afeb1f545d1e431dcf55fd30e2b0e16e00151d0ebee74510e94ec9c27f6e9c91378666139635f13cc61c7914c764dc57cf67c8183c8b0e388"' : 'data-bs-target="#xs-injectables-links-module-MenuModule-d6abf8685ca7377afeb1f545d1e431dcf55fd30e2b0e16e00151d0ebee74510e94ec9c27f6e9c91378666139635f13cc61c7914c764dc57cf67c8183c8b0e388"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MenuModule-d6abf8685ca7377afeb1f545d1e431dcf55fd30e2b0e16e00151d0ebee74510e94ec9c27f6e9c91378666139635f13cc61c7914c764dc57cf67c8183c8b0e388"' :
                                        'id="xs-injectables-links-module-MenuModule-d6abf8685ca7377afeb1f545d1e431dcf55fd30e2b0e16e00151d0ebee74510e94ec9c27f6e9c91378666139635f13cc61c7914c764dc57cf67c8183c8b0e388"' }>
                                        <li class="link">
                                            <a href="injectables/MenuService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MultiSelectFormcontrolModule.html" data-type="entity-link" >MultiSelectFormcontrolModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-MultiSelectFormcontrolModule-9d160fed164f86d71a0ed6d916713a7b807fbe87496c4d9f590de06b985e6913257f49ac3da69578514e97388cc38739b088fa9226744a8669f98003dc400150"' : 'data-bs-target="#xs-components-links-module-MultiSelectFormcontrolModule-9d160fed164f86d71a0ed6d916713a7b807fbe87496c4d9f590de06b985e6913257f49ac3da69578514e97388cc38739b088fa9226744a8669f98003dc400150"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-MultiSelectFormcontrolModule-9d160fed164f86d71a0ed6d916713a7b807fbe87496c4d9f590de06b985e6913257f49ac3da69578514e97388cc38739b088fa9226744a8669f98003dc400150"' :
                                            'id="xs-components-links-module-MultiSelectFormcontrolModule-9d160fed164f86d71a0ed6d916713a7b807fbe87496c4d9f590de06b985e6913257f49ac3da69578514e97388cc38739b088fa9226744a8669f98003dc400150"' }>
                                            <li class="link">
                                                <a href="components/MultiSelectFormcontrolComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MultiSelectFormcontrolComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/MultiValueModule.html" data-type="entity-link" >MultiValueModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MultiValueModule-01573e1b0efb54875c85e8839e8f5771a8bc0037bba7071ee92e8aa90d672e89fc3d77c641cb0ce2b2fd1ca557ab07c1dcdb033b3f22b34ba546919efb327ad9"' : 'data-bs-target="#xs-injectables-links-module-MultiValueModule-01573e1b0efb54875c85e8839e8f5771a8bc0037bba7071ee92e8aa90d672e89fc3d77c641cb0ce2b2fd1ca557ab07c1dcdb033b3f22b34ba546919efb327ad9"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MultiValueModule-01573e1b0efb54875c85e8839e8f5771a8bc0037bba7071ee92e8aa90d672e89fc3d77c641cb0ce2b2fd1ca557ab07c1dcdb033b3f22b34ba546919efb327ad9"' :
                                        'id="xs-injectables-links-module-MultiValueModule-01573e1b0efb54875c85e8839e8f5771a8bc0037bba7071ee92e8aa90d672e89fc3d77c641cb0ce2b2fd1ca557ab07c1dcdb033b3f22b34ba546919efb327ad9"' }>
                                        <li class="link">
                                            <a href="injectables/MultiValueService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MultiValueService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ObjectHistoryModule.html" data-type="entity-link" >ObjectHistoryModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-ObjectHistoryModule-42127ce65ae3ca6cd5e047b626f3eaf3abe88a40d08d1a7a32ab96b14be01d28bbcdaf7933bbd752ab34f4944578c7a19b43385b251fffe2d44b1ae722c383dc"' : 'data-bs-target="#xs-components-links-module-ObjectHistoryModule-42127ce65ae3ca6cd5e047b626f3eaf3abe88a40d08d1a7a32ab96b14be01d28bbcdaf7933bbd752ab34f4944578c7a19b43385b251fffe2d44b1ae722c383dc"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ObjectHistoryModule-42127ce65ae3ca6cd5e047b626f3eaf3abe88a40d08d1a7a32ab96b14be01d28bbcdaf7933bbd752ab34f4944578c7a19b43385b251fffe2d44b1ae722c383dc"' :
                                            'id="xs-components-links-module-ObjectHistoryModule-42127ce65ae3ca6cd5e047b626f3eaf3abe88a40d08d1a7a32ab96b14be01d28bbcdaf7933bbd752ab34f4944578c7a19b43385b251fffe2d44b1ae722c383dc"' }>
                                            <li class="link">
                                                <a href="components/ObjectHistoryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ObjectHistoryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ObjectHistoryGridviewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ObjectHistoryGridviewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ObjectHistoryStateComparisonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ObjectHistoryStateComparisonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ObjectHistoryStateOverviewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ObjectHistoryStateOverviewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TimelineComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TimelineComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/OrderedListModule.html" data-type="entity-link" >OrderedListModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-OrderedListModule-43579b7047cc052ceb97514c88ee26f873498bd204b4b9ad13eef6055054bf7c52f1b608418544e14e4e6426980f5e53a9ed4958bad25e3119ede1e248ce4bc5"' : 'data-bs-target="#xs-components-links-module-OrderedListModule-43579b7047cc052ceb97514c88ee26f873498bd204b4b9ad13eef6055054bf7c52f1b608418544e14e4e6426980f5e53a9ed4958bad25e3119ede1e248ce4bc5"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-OrderedListModule-43579b7047cc052ceb97514c88ee26f873498bd204b4b9ad13eef6055054bf7c52f1b608418544e14e4e6426980f5e53a9ed4958bad25e3119ede1e248ce4bc5"' :
                                            'id="xs-components-links-module-OrderedListModule-43579b7047cc052ceb97514c88ee26f873498bd204b4b9ad13eef6055054bf7c52f1b608418544e14e4e6426980f5e53a9ed4958bad25e3119ede1e248ce4bc5"' }>
                                            <li class="link">
                                                <a href="components/OrderedListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderedListComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ParameterizedTextModule.html" data-type="entity-link" >ParameterizedTextModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-ParameterizedTextModule-396cfc1a4a662cba6ce1efe30fc9ca14ba5f6bce3023d0b8e17edd90ec7004e4f68ae20c45ef0b41ae95b9114808ca665c65caa4ae53e7d309b5ed5e986615b6"' : 'data-bs-target="#xs-components-links-module-ParameterizedTextModule-396cfc1a4a662cba6ce1efe30fc9ca14ba5f6bce3023d0b8e17edd90ec7004e4f68ae20c45ef0b41ae95b9114808ca665c65caa4ae53e7d309b5ed5e986615b6"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ParameterizedTextModule-396cfc1a4a662cba6ce1efe30fc9ca14ba5f6bce3023d0b8e17edd90ec7004e4f68ae20c45ef0b41ae95b9114808ca665c65caa4ae53e7d309b5ed5e986615b6"' :
                                            'id="xs-components-links-module-ParameterizedTextModule-396cfc1a4a662cba6ce1efe30fc9ca14ba5f6bce3023d0b8e17edd90ec7004e4f68ae20c45ef0b41ae95b9114808ca665c65caa4ae53e7d309b5ed5e986615b6"' }>
                                            <li class="link">
                                                <a href="components/ParameterizedTextComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ParameterizedTextComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/QbmModule.html" data-type="entity-link" >QbmModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-QbmModule-1589113762e80a4f87df2edeff6bd1c0ebfde92445f9b7481021acb2a33e479ab60b649ed86206218296888b119eb4f78cc1f3536c5ba4cb3f88741f306f7a64"' : 'data-bs-target="#xs-components-links-module-QbmModule-1589113762e80a4f87df2edeff6bd1c0ebfde92445f9b7481021acb2a33e479ab60b649ed86206218296888b119eb4f78cc1f3536c5ba4cb3f88741f306f7a64"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-QbmModule-1589113762e80a4f87df2edeff6bd1c0ebfde92445f9b7481021acb2a33e479ab60b649ed86206218296888b119eb4f78cc1f3536c5ba4cb3f88741f306f7a64"' :
                                            'id="xs-components-links-module-QbmModule-1589113762e80a4f87df2edeff6bd1c0ebfde92445f9b7481021acb2a33e479ab60b649ed86206218296888b119eb4f78cc1f3536c5ba4cb3f88741f306f7a64"' }>
                                            <li class="link">
                                                <a href="components/AboutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AboutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AutoCompleteComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AutoCompleteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CdrEditorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CdrEditorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConnectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConnectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ExtComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExtComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FilterTileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FilterTileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IconStackComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IconStackComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImxMatColumnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImxMatColumnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImxProgressbarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImxProgressbarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImxTreeTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImxTreeTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MasterDetailComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" class="deprecated-name">MasterDetailComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MessageDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MessageDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SearchBarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchBarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TempBillboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" class="deprecated-name">TempBillboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TranslationEditorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TranslationEditorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TwoFactorAuthenticationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TwoFactorAuthenticationComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-QbmModule-1589113762e80a4f87df2edeff6bd1c0ebfde92445f9b7481021acb2a33e479ab60b649ed86206218296888b119eb4f78cc1f3536c5ba4cb3f88741f306f7a64"' : 'data-bs-target="#xs-directives-links-module-QbmModule-1589113762e80a4f87df2edeff6bd1c0ebfde92445f9b7481021acb2a33e479ab60b649ed86206218296888b119eb4f78cc1f3536c5ba4cb3f88741f306f7a64"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-QbmModule-1589113762e80a4f87df2edeff6bd1c0ebfde92445f9b7481021acb2a33e479ab60b649ed86206218296888b119eb4f78cc1f3536c5ba4cb3f88741f306f7a64"' :
                                        'id="xs-directives-links-module-QbmModule-1589113762e80a4f87df2edeff6bd1c0ebfde92445f9b7481021acb2a33e479ab60b649ed86206218296888b119eb4f78cc1f3536c5ba4cb3f88741f306f7a64"' }>
                                        <li class="link">
                                            <a href="directives/ExtDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExtDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-QbmModule-1589113762e80a4f87df2edeff6bd1c0ebfde92445f9b7481021acb2a33e479ab60b649ed86206218296888b119eb4f78cc1f3536c5ba4cb3f88741f306f7a64"' : 'data-bs-target="#xs-injectables-links-module-QbmModule-1589113762e80a4f87df2edeff6bd1c0ebfde92445f9b7481021acb2a33e479ab60b649ed86206218296888b119eb4f78cc1f3536c5ba4cb3f88741f306f7a64"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-QbmModule-1589113762e80a4f87df2edeff6bd1c0ebfde92445f9b7481021acb2a33e479ab60b649ed86206218296888b119eb4f78cc1f3536c5ba4cb3f88741f306f7a64"' :
                                        'id="xs-injectables-links-module-QbmModule-1589113762e80a4f87df2edeff6bd1c0ebfde92445f9b7481021acb2a33e479ab60b649ed86206218296888b119eb4f78cc1f3536c5ba4cb3f88741f306f7a64"' }>
                                        <li class="link">
                                            <a href="injectables/AboutService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AboutService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ApiClientAngularService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ApiClientAngularService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AppConfigService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppConfigService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DeviceStateService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" class="deprecated-name">DeviceStateService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ExtService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExtService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/GlobalErrorHandler.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GlobalErrorHandler</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ImxTranslateLoader.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImxTranslateLoader</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ImxTranslationProviderService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImxTranslationProviderService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MetadataService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetadataService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OpsupportDbObjectService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OpsupportDbObjectService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PluginLoaderService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PluginLoaderService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RegistryService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RegistryService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SnackBarService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SnackBarService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TableImageService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TableImageService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TwoFactorAuthenticationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TwoFactorAuthenticationService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserActionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserActionService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/imx_QBM_SearchService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >imx_QBM_SearchService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/imx_SessionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >imx_SessionService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RouteGuardModule.html" data-type="entity-link" >RouteGuardModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SelectedElementsModule.html" data-type="entity-link" >SelectedElementsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-SelectedElementsModule-bcc086d4f12b256249eb0212b61eb15625ae0ad95c9f77f247b3bf633e8cc8cf3d822b2aefc8e90f27027e91d53064789b4801bc8058230d51f9b7f3265ae112"' : 'data-bs-target="#xs-components-links-module-SelectedElementsModule-bcc086d4f12b256249eb0212b61eb15625ae0ad95c9f77f247b3bf633e8cc8cf3d822b2aefc8e90f27027e91d53064789b4801bc8058230d51f9b7f3265ae112"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SelectedElementsModule-bcc086d4f12b256249eb0212b61eb15625ae0ad95c9f77f247b3bf633e8cc8cf3d822b2aefc8e90f27027e91d53064789b4801bc8058230d51f9b7f3265ae112"' :
                                            'id="xs-components-links-module-SelectedElementsModule-bcc086d4f12b256249eb0212b61eb15625ae0ad95c9f77f247b3bf633e8cc8cf3d822b2aefc8e90f27027e91d53064789b4801bc8058230d51f9b7f3265ae112"' }>
                                            <li class="link">
                                                <a href="components/SelectedElementsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SelectedElementsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SelectedElementsDialog.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SelectedElementsDialog</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/SelectModule.html" data-type="entity-link" >SelectModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-SelectModule-fdc449c99bb296c92154cfec2b56627df4f97baa377f5099cde342928f8eb3ba0615cec88453d63571c5da8bebfb350b706c60c8f82eb986419afacef74e269e"' : 'data-bs-target="#xs-components-links-module-SelectModule-fdc449c99bb296c92154cfec2b56627df4f97baa377f5099cde342928f8eb3ba0615cec88453d63571c5da8bebfb350b706c60c8f82eb986419afacef74e269e"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SelectModule-fdc449c99bb296c92154cfec2b56627df4f97baa377f5099cde342928f8eb3ba0615cec88453d63571c5da8bebfb350b706c60c8f82eb986419afacef74e269e"' :
                                            'id="xs-components-links-module-SelectModule-fdc449c99bb296c92154cfec2b56627df4f97baa377f5099cde342928f8eb3ba0615cec88453d63571c5da8bebfb350b706c60c8f82eb986419afacef74e269e"' }>
                                            <li class="link">
                                                <a href="components/AutocompleteComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AutocompleteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SelectComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/SideNavigationViewModule.html" data-type="entity-link" >SideNavigationViewModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-SideNavigationViewModule-eeb07dd96aaaca785f157c5a25dc95aa28b743f8b17f7b6baaa2e56a1995ffb5e328c5e72dc228d1086dd49d32ba376fc38bf03f1e032b0aaa931a1a9215e561"' : 'data-bs-target="#xs-components-links-module-SideNavigationViewModule-eeb07dd96aaaca785f157c5a25dc95aa28b743f8b17f7b6baaa2e56a1995ffb5e328c5e72dc228d1086dd49d32ba376fc38bf03f1e032b0aaa931a1a9215e561"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SideNavigationViewModule-eeb07dd96aaaca785f157c5a25dc95aa28b743f8b17f7b6baaa2e56a1995ffb5e328c5e72dc228d1086dd49d32ba376fc38bf03f1e032b0aaa931a1a9215e561"' :
                                            'id="xs-components-links-module-SideNavigationViewModule-eeb07dd96aaaca785f157c5a25dc95aa28b743f8b17f7b6baaa2e56a1995ffb5e328c5e72dc228d1086dd49d32ba376fc38bf03f1e032b0aaa931a1a9215e561"' }>
                                            <li class="link">
                                                <a href="components/SideNavigationViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SideNavigationViewComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/SidenavTreeModule.html" data-type="entity-link" >SidenavTreeModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-SidenavTreeModule-684b82088c459f63f2dcddca8d59854c9f95390cfdf630332549083a24939814c79ba5a5d34abf1d553f835599d89e4c82c98b9dc4fd3ff56901a78c4b6c0b79"' : 'data-bs-target="#xs-components-links-module-SidenavTreeModule-684b82088c459f63f2dcddca8d59854c9f95390cfdf630332549083a24939814c79ba5a5d34abf1d553f835599d89e4c82c98b9dc4fd3ff56901a78c4b6c0b79"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SidenavTreeModule-684b82088c459f63f2dcddca8d59854c9f95390cfdf630332549083a24939814c79ba5a5d34abf1d553f835599d89e4c82c98b9dc4fd3ff56901a78c4b6c0b79"' :
                                            'id="xs-components-links-module-SidenavTreeModule-684b82088c459f63f2dcddca8d59854c9f95390cfdf630332549083a24939814c79ba5a5d34abf1d553f835599d89e4c82c98b9dc4fd3ff56901a78c4b6c0b79"' }>
                                            <li class="link">
                                                <a href="components/SidenavTreeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SidenavTreeComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/SqlWizardModule.html" data-type="entity-link" >SqlWizardModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-SqlWizardModule-4839e809449337a18196de95d659c93c12e91eb0c3c757676d47f7f7174dde793278fa60b73118b5a2559160cc5717525b18b4d335cb31b839621b26aa7e4edb"' : 'data-bs-target="#xs-components-links-module-SqlWizardModule-4839e809449337a18196de95d659c93c12e91eb0c3c757676d47f7f7174dde793278fa60b73118b5a2559160cc5717525b18b4d335cb31b839621b26aa7e4edb"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SqlWizardModule-4839e809449337a18196de95d659c93c12e91eb0c3c757676d47f7f7174dde793278fa60b73118b5a2559160cc5717525b18b4d335cb31b839621b26aa7e4edb"' :
                                            'id="xs-components-links-module-SqlWizardModule-4839e809449337a18196de95d659c93c12e91eb0c3c757676d47f7f7174dde793278fa60b73118b5a2559160cc5717525b18b4d335cb31b839621b26aa7e4edb"' }>
                                            <li class="link">
                                                <a href="components/ColumnSelectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ColumnSelectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DatePickerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DatePickerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SimpleExpressionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SimpleExpressionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SingleExpressionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SingleExpressionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SingleValueComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SingleValueComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SqlWizardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SqlWizardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TableSelectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TableSelectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WhereClauseExpressionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WhereClauseExpressionComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SqlWizardModule-4839e809449337a18196de95d659c93c12e91eb0c3c757676d47f7f7174dde793278fa60b73118b5a2559160cc5717525b18b4d335cb31b839621b26aa7e4edb"' : 'data-bs-target="#xs-injectables-links-module-SqlWizardModule-4839e809449337a18196de95d659c93c12e91eb0c3c757676d47f7f7174dde793278fa60b73118b5a2559160cc5717525b18b4d335cb31b839621b26aa7e4edb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SqlWizardModule-4839e809449337a18196de95d659c93c12e91eb0c3c757676d47f7f7174dde793278fa60b73118b5a2559160cc5717525b18b4d335cb31b839621b26aa7e4edb"' :
                                        'id="xs-injectables-links-module-SqlWizardModule-4839e809449337a18196de95d659c93c12e91eb0c3c757676d47f7f7174dde793278fa60b73118b5a2559160cc5717525b18b4d335cb31b839621b26aa7e4edb"' }>
                                        <li class="link">
                                            <a href="injectables/SqlWizardService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SqlWizardService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/StorageModule.html" data-type="entity-link" >StorageModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-StorageModule-6cc4e0d8f67e38ab2238779e91094ae1154d67c5788ba91cf57924772a3629bee6fe3ae6872ab5ddfa28b3147f8a54ff57d2a6495e37bfba1a5f0d8929a16c3c"' : 'data-bs-target="#xs-injectables-links-module-StorageModule-6cc4e0d8f67e38ab2238779e91094ae1154d67c5788ba91cf57924772a3629bee6fe3ae6872ab5ddfa28b3147f8a54ff57d2a6495e37bfba1a5f0d8929a16c3c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StorageModule-6cc4e0d8f67e38ab2238779e91094ae1154d67c5788ba91cf57924772a3629bee6fe3ae6872ab5ddfa28b3147f8a54ff57d2a6495e37bfba1a5f0d8929a16c3c"' :
                                        'id="xs-injectables-links-module-StorageModule-6cc4e0d8f67e38ab2238779e91094ae1154d67c5788ba91cf57924772a3629bee6fe3ae6872ab5ddfa28b3147f8a54ff57d2a6495e37bfba1a5f0d8929a16c3c"' }>
                                        <li class="link">
                                            <a href="injectables/StorageService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorageService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TempBillboardModule.html" data-type="entity-link" class="deprecated-name">TempBillboardModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-TempBillboardModule-1901f281c27bc8454b0dbd28603bd1cf931aac4cbc1ce77510496e122dee5cd8b4b6b509aef4d7e4b3638f63940a2acd0f7ad8b6b8f71736c31f66b4ee290f73"' : 'data-bs-target="#xs-components-links-module-TempBillboardModule-1901f281c27bc8454b0dbd28603bd1cf931aac4cbc1ce77510496e122dee5cd8b4b6b509aef4d7e4b3638f63940a2acd0f7ad8b6b8f71736c31f66b4ee290f73"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-TempBillboardModule-1901f281c27bc8454b0dbd28603bd1cf931aac4cbc1ce77510496e122dee5cd8b4b6b509aef4d7e4b3638f63940a2acd0f7ad8b6b8f71736c31f66b4ee290f73"' :
                                            'id="xs-components-links-module-TempBillboardModule-1901f281c27bc8454b0dbd28603bd1cf931aac4cbc1ce77510496e122dee5cd8b4b6b509aef4d7e4b3638f63940a2acd0f7ad8b6b8f71736c31f66b4ee290f73"' }>
                                            <li class="link">
                                                <a href="components/TempBillboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" class="deprecated-name">TempBillboardComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TempBillboardModule-1901f281c27bc8454b0dbd28603bd1cf931aac4cbc1ce77510496e122dee5cd8b4b6b509aef4d7e4b3638f63940a2acd0f7ad8b6b8f71736c31f66b4ee290f73"' : 'data-bs-target="#xs-injectables-links-module-TempBillboardModule-1901f281c27bc8454b0dbd28603bd1cf931aac4cbc1ce77510496e122dee5cd8b4b6b509aef4d7e4b3638f63940a2acd0f7ad8b6b8f71736c31f66b4ee290f73"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TempBillboardModule-1901f281c27bc8454b0dbd28603bd1cf931aac4cbc1ce77510496e122dee5cd8b4b6b509aef4d7e4b3638f63940a2acd0f7ad8b6b8f71736c31f66b4ee290f73"' :
                                        'id="xs-injectables-links-module-TempBillboardModule-1901f281c27bc8454b0dbd28603bd1cf931aac4cbc1ce77510496e122dee5cd8b4b6b509aef4d7e4b3638f63940a2acd0f7ad8b6b8f71736c31f66b4ee290f73"' }>
                                        <li class="link">
                                            <a href="injectables/TempBillboardService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" class="deprecated-name">TempBillboardService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TileModule.html" data-type="entity-link" >TileModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-TileModule-6248be6bbd88013137a3c786f22594def82bd4ac3df8801ef790003f30ac7569fdcbdb5d1e3c3d0d9f7c9d42eee12c2f92ee089eec4f6281cf888dbcb83f5273"' : 'data-bs-target="#xs-components-links-module-TileModule-6248be6bbd88013137a3c786f22594def82bd4ac3df8801ef790003f30ac7569fdcbdb5d1e3c3d0d9f7c9d42eee12c2f92ee089eec4f6281cf888dbcb83f5273"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-TileModule-6248be6bbd88013137a3c786f22594def82bd4ac3df8801ef790003f30ac7569fdcbdb5d1e3c3d0d9f7c9d42eee12c2f92ee089eec4f6281cf888dbcb83f5273"' :
                                            'id="xs-components-links-module-TileModule-6248be6bbd88013137a3c786f22594def82bd4ac3df8801ef790003f30ac7569fdcbdb5d1e3c3d0d9f7c9d42eee12c2f92ee089eec4f6281cf888dbcb83f5273"' }>
                                            <li class="link">
                                                <a href="components/ChartTileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChartTileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TileComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UserMessageModule.html" data-type="entity-link" >UserMessageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-UserMessageModule-0401f3bce26f0a0c7fd9240b15986424db17a98d570861ad4376a03f991ce09febdb45e20ecfac39639a6acaa3d7104c8de89db4334964ca2cc9051b0df3ecc5"' : 'data-bs-target="#xs-components-links-module-UserMessageModule-0401f3bce26f0a0c7fd9240b15986424db17a98d570861ad4376a03f991ce09febdb45e20ecfac39639a6acaa3d7104c8de89db4334964ca2cc9051b0df3ecc5"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UserMessageModule-0401f3bce26f0a0c7fd9240b15986424db17a98d570861ad4376a03f991ce09febdb45e20ecfac39639a6acaa3d7104c8de89db4334964ca2cc9051b0df3ecc5"' :
                                            'id="xs-components-links-module-UserMessageModule-0401f3bce26f0a0c7fd9240b15986424db17a98d570861ad4376a03f991ce09febdb45e20ecfac39639a6acaa3d7104c8de89db4334964ca2cc9051b0df3ecc5"' }>
                                            <li class="link">
                                                <a href="components/UserMessageComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserMessageComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UserMessageModule-0401f3bce26f0a0c7fd9240b15986424db17a98d570861ad4376a03f991ce09febdb45e20ecfac39639a6acaa3d7104c8de89db4334964ca2cc9051b0df3ecc5"' : 'data-bs-target="#xs-injectables-links-module-UserMessageModule-0401f3bce26f0a0c7fd9240b15986424db17a98d570861ad4376a03f991ce09febdb45e20ecfac39639a6acaa3d7104c8de89db4334964ca2cc9051b0df3ecc5"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UserMessageModule-0401f3bce26f0a0c7fd9240b15986424db17a98d570861ad4376a03f991ce09febdb45e20ecfac39639a6acaa3d7104c8de89db4334964ca2cc9051b0df3ecc5"' :
                                        'id="xs-injectables-links-module-UserMessageModule-0401f3bce26f0a0c7fd9240b15986424db17a98d570861ad4376a03f991ce09febdb45e20ecfac39639a6acaa3d7104c8de89db4334964ca2cc9051b0df3ecc5"' }>
                                        <li class="link">
                                            <a href="injectables/UserMessageService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserMessageService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/EditorBase.html" data-type="entity-link" >EditorBase</a>
                            </li>
                            <li class="link">
                                <a href="components/IndexBarComponent.html" data-type="entity-link" >IndexBarComponent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/ApiClientFetch.html" data-type="entity-link" >ApiClientFetch</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseCdr.html" data-type="entity-link" >BaseCdr</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseCdrEditorProvider.html" data-type="entity-link" >BaseCdrEditorProvider</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseReadonlyCdr.html" data-type="entity-link" >BaseReadonlyCdr</a>
                            </li>
                            <li class="link">
                                <a href="classes/CandidateEntity.html" data-type="entity-link" >CandidateEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/Column.html" data-type="entity-link" >Column</a>
                            </li>
                            <li class="link">
                                <a href="classes/Column-1.html" data-type="entity-link" >Column</a>
                            </li>
                            <li class="link">
                                <a href="classes/Column-2.html" data-type="entity-link" >Column</a>
                            </li>
                            <li class="link">
                                <a href="classes/ColumnOptions.html" data-type="entity-link" >ColumnOptions</a>
                            </li>
                            <li class="link">
                                <a href="classes/ConfigSection.html" data-type="entity-link" >ConfigSection</a>
                            </li>
                            <li class="link">
                                <a href="classes/Connector.html" data-type="entity-link" >Connector</a>
                            </li>
                            <li class="link">
                                <a href="classes/ConnectorProvider.html" data-type="entity-link" >ConnectorProvider</a>
                            </li>
                            <li class="link">
                                <a href="classes/Connectors.html" data-type="entity-link" >Connectors</a>
                            </li>
                            <li class="link">
                                <a href="classes/DataSourceWrapper.html" data-type="entity-link" >DataSourceWrapper</a>
                            </li>
                            <li class="link">
                                <a href="classes/DateParser.html" data-type="entity-link" >DateParser</a>
                            </li>
                            <li class="link">
                                <a href="classes/DbObjectInfo.html" data-type="entity-link" >DbObjectInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/DefaultCdrEditorProvider.html" data-type="entity-link" >DefaultCdrEditorProvider</a>
                            </li>
                            <li class="link">
                                <a href="classes/DynamicDataApiControls.html" data-type="entity-link" >DynamicDataApiControls</a>
                            </li>
                            <li class="link">
                                <a href="classes/DynamicDataSource.html" data-type="entity-link" >DynamicDataSource</a>
                            </li>
                            <li class="link">
                                <a href="classes/DynamicMethod.html" data-type="entity-link" >DynamicMethod</a>
                            </li>
                            <li class="link">
                                <a href="classes/DynFkContainer.html" data-type="entity-link" >DynFkContainer</a>
                            </li>
                            <li class="link">
                                <a href="classes/EntityColumnContainer.html" data-type="entity-link" >EntityColumnContainer</a>
                            </li>
                            <li class="link">
                                <a href="classes/EntityTreeDatabase.html" data-type="entity-link" >EntityTreeDatabase</a>
                            </li>
                            <li class="link">
                                <a href="classes/FilterTreeDatabase.html" data-type="entity-link" >FilterTreeDatabase</a>
                            </li>
                            <li class="link">
                                <a href="classes/FkCdrEditorProvider.html" data-type="entity-link" >FkCdrEditorProvider</a>
                            </li>
                            <li class="link">
                                <a href="classes/FkContainer.html" data-type="entity-link" >FkContainer</a>
                            </li>
                            <li class="link">
                                <a href="classes/FkSelectionContainer.html" data-type="entity-link" >FkSelectionContainer</a>
                            </li>
                            <li class="link">
                                <a href="classes/GenericTypedEntity.html" data-type="entity-link" >GenericTypedEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/GroupMenuItem.html" data-type="entity-link" >GroupMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/Guid.html" data-type="entity-link" >Guid</a>
                            </li>
                            <li class="link">
                                <a href="classes/HierarchicalCandidate.html" data-type="entity-link" >HierarchicalCandidate</a>
                            </li>
                            <li class="link">
                                <a href="classes/HierarchicalFkDatabase.html" data-type="entity-link" >HierarchicalFkDatabase</a>
                            </li>
                            <li class="link">
                                <a href="classes/HyperviewLayoutHierarchical.html" data-type="entity-link" >HyperviewLayoutHierarchical</a>
                            </li>
                            <li class="link">
                                <a href="classes/HyperviewLayoutHorizontal.html" data-type="entity-link" >HyperviewLayoutHorizontal</a>
                            </li>
                            <li class="link">
                                <a href="classes/HyperviewLayoutVertical.html" data-type="entity-link" >HyperviewLayoutVertical</a>
                            </li>
                            <li class="link">
                                <a href="classes/ImxDataSource.html" data-type="entity-link" >ImxDataSource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ImxExpandableItem.html" data-type="entity-link" >ImxExpandableItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/ImxMissingTranslationHandler.html" data-type="entity-link" >ImxMissingTranslationHandler</a>
                            </li>
                            <li class="link">
                                <a href="classes/LimitedValuesContainer.html" data-type="entity-link" >LimitedValuesContainer</a>
                            </li>
                            <li class="link">
                                <a href="classes/LineChartOptions.html" data-type="entity-link" >LineChartOptions</a>
                            </li>
                            <li class="link">
                                <a href="classes/NavigationMenuItem.html" data-type="entity-link" >NavigationMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/ObjectHistoryApiService.html" data-type="entity-link" >ObjectHistoryApiService</a>
                            </li>
                            <li class="link">
                                <a href="classes/Paginator.html" data-type="entity-link" >Paginator</a>
                            </li>
                            <li class="link">
                                <a href="classes/QueryParametersHandler.html" data-type="entity-link" >QueryParametersHandler</a>
                            </li>
                            <li class="link">
                                <a href="classes/RelatedApplicationMenuItem.html" data-type="entity-link" >RelatedApplicationMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/SelectDataSource.html" data-type="entity-link" >SelectDataSource</a>
                            </li>
                            <li class="link">
                                <a href="classes/SelectionModelWrapper.html" data-type="entity-link" >SelectionModelWrapper</a>
                            </li>
                            <li class="link">
                                <a href="classes/SeriesInformation.html" data-type="entity-link" >SeriesInformation</a>
                            </li>
                            <li class="link">
                                <a href="classes/ServerError.html" data-type="entity-link" >ServerError</a>
                            </li>
                            <li class="link">
                                <a href="classes/ServerExceptionError.html" data-type="entity-link" >ServerExceptionError</a>
                            </li>
                            <li class="link">
                                <a href="classes/SessionState.html" data-type="entity-link" >SessionState</a>
                            </li>
                            <li class="link">
                                <a href="classes/SqlNodeView.html" data-type="entity-link" >SqlNodeView</a>
                            </li>
                            <li class="link">
                                <a href="classes/SqlViewBase.html" data-type="entity-link" >SqlViewBase</a>
                            </li>
                            <li class="link">
                                <a href="classes/SqlViewRoot.html" data-type="entity-link" >SqlViewRoot</a>
                            </li>
                            <li class="link">
                                <a href="classes/SqlViewSettings.html" data-type="entity-link" >SqlViewSettings</a>
                            </li>
                            <li class="link">
                                <a href="classes/SqlWizardApiService.html" data-type="entity-link" >SqlWizardApiService</a>
                            </li>
                            <li class="link">
                                <a href="classes/StatusBuffer.html" data-type="entity-link" >StatusBuffer</a>
                            </li>
                            <li class="link">
                                <a href="classes/StatusInfo.html" data-type="entity-link" >StatusInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/StatusInfo2.html" data-type="entity-link" >StatusInfo2</a>
                            </li>
                            <li class="link">
                                <a href="classes/TimezoneInfo.html" data-type="entity-link" >TimezoneInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/TreeDatabase.html" data-type="entity-link" >TreeDatabase</a>
                            </li>
                            <li class="link">
                                <a href="classes/TreeDatasource.html" data-type="entity-link" >TreeDatasource</a>
                            </li>
                            <li class="link">
                                <a href="classes/TreeNode.html" data-type="entity-link" >TreeNode</a>
                            </li>
                            <li class="link">
                                <a href="classes/ViewMode.html" data-type="entity-link" >ViewMode</a>
                            </li>
                            <li class="link">
                                <a href="classes/XAxisInformation.html" data-type="entity-link" >XAxisInformation</a>
                            </li>
                            <li class="link">
                                <a href="classes/YAxisInformation.html" data-type="entity-link" >YAxisInformation</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/ApiClientService.html" data-type="entity-link" >ApiClientService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/Base64ImageService.html" data-type="entity-link" >Base64ImageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BusyService.html" data-type="entity-link" >BusyService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CacheService.html" data-type="entity-link" >CacheService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CaptchaService.html" data-type="entity-link" >CaptchaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CdrFactoryService.html" data-type="entity-link" >CdrFactoryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CustomThemeService.html" data-type="entity-link" >CustomThemeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DocChapterService.html" data-type="entity-link" >DocChapterService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DynamicMethodService.html" data-type="entity-link" >DynamicMethodService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ElementalUiConfigService.html" data-type="entity-link" >ElementalUiConfigService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ErrorService.html" data-type="entity-link" >ErrorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExportColumnsService.html" data-type="entity-link" >ExportColumnsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FileSelectorService.html" data-type="entity-link" >FileSelectorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FilterTreeEntityWrapperService.html" data-type="entity-link" >FilterTreeEntityWrapperService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FilterWizardService.html" data-type="entity-link" >FilterWizardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FkCandidateEntityBuilderService.html" data-type="entity-link" >FkCandidateEntityBuilderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HelpContextualService.html" data-type="entity-link" >HelpContextualService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IeWarningService.html" data-type="entity-link" >IeWarningService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MethodDescriptorService.html" data-type="entity-link" >MethodDescriptorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ModelCssService.html" data-type="entity-link" >ModelCssService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NavigationService.html" data-type="entity-link" class="deprecated-name">NavigationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NumberValidatorService.html" data-type="entity-link" >NumberValidatorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ObjectHistoryService.html" data-type="entity-link" >ObjectHistoryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ParameterizedTextService.html" data-type="entity-link" >ParameterizedTextService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/QbmSqlWizardService.html" data-type="entity-link" >QbmSqlWizardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RedirectService.html" data-type="entity-link" >RedirectService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SettingsService.html" data-type="entity-link" >SettingsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SplashService.html" data-type="entity-link" >SplashService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SystemInfoService.html" data-type="entity-link" >SystemInfoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TypedEntityBuilderService.html" data-type="entity-link" >TypedEntityBuilderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UrlValidatorService.html" data-type="entity-link" >UrlValidatorService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthenticationGuardService.html" data-type="entity-link" >AuthenticationGuardService</a>
                            </li>
                            <li class="link">
                                <a href="guards/RouteGuardService.html" data-type="entity-link" >RouteGuardService</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AdminComponent.html" data-type="entity-link" >AdminComponent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AppConfig.html" data-type="entity-link" >AppConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthConfigProvider.html" data-type="entity-link" >AuthConfigProvider</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthPropDataProvider.html" data-type="entity-link" >AuthPropDataProvider</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BulkItem.html" data-type="entity-link" >BulkItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BulkItemIcon.html" data-type="entity-link" >BulkItemIcon</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Busy.html" data-type="entity-link" >Busy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CacheOptions.html" data-type="entity-link" >CacheOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Candidate.html" data-type="entity-link" >Candidate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CdrEditor.html" data-type="entity-link" >CdrEditor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CdrEditorProvider.html" data-type="entity-link" >CdrEditorProvider</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CdrEditorProviderRegistry.html" data-type="entity-link" >CdrEditorProviderRegistry</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CdrSidesheetConfig.html" data-type="entity-link" >CdrSidesheetConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPropertyForTableColumns.html" data-type="entity-link" >ClientPropertyForTableColumns</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ColumnDependentReference.html" data-type="entity-link" >ColumnDependentReference</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ComponentCanDeactivate.html" data-type="entity-link" >ComponentCanDeactivate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConnectionSessionInfoData.html" data-type="entity-link" >ConnectionSessionInfoData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Coord.html" data-type="entity-link" >Coord</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CustomAuthFlow.html" data-type="entity-link" >CustomAuthFlow</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataModelFilterOptionExtended.html" data-type="entity-link" >DataModelFilterOptionExtended</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataModelWrapper.html" data-type="entity-link" >DataModelWrapper</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataNavigationParameters.html" data-type="entity-link" >DataNavigationParameters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataSourceItemStatus.html" data-type="entity-link" >DataSourceItemStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataSourceToolbarExportMethod.html" data-type="entity-link" >DataSourceToolbarExportMethod</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataSourceToolbarFilter.html" data-type="entity-link" >DataSourceToolbarFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataSourceToolBarGroup.html" data-type="entity-link" >DataSourceToolBarGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataSourceToolbarGroupData.html" data-type="entity-link" >DataSourceToolbarGroupData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataSourceToolBarGroupingCategory.html" data-type="entity-link" >DataSourceToolBarGroupingCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataSourceToolbarMenuItem.html" data-type="entity-link" >DataSourceToolbarMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataSourceToolbarSelectedFilter.html" data-type="entity-link" >DataSourceToolbarSelectedFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataSourceToolbarSettings.html" data-type="entity-link" >DataSourceToolbarSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataSourceToolbarViewConfig.html" data-type="entity-link" >DataSourceToolbarViewConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataTableGroupedData.html" data-type="entity-link" >DataTableGroupedData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataTileBadge.html" data-type="entity-link" >DataTileBadge</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataTileMenuItem.html" data-type="entity-link" >DataTileMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DateDiffOption.html" data-type="entity-link" >DateDiffOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocChapter.html" data-type="entity-link" >DocChapter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocDocument.html" data-type="entity-link" >DocDocument</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DSTExportState.html" data-type="entity-link" >DSTExportState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DSTViewConfig.html" data-type="entity-link" >DSTViewConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DynamicCollectionLoadParameters.html" data-type="entity-link" >DynamicCollectionLoadParameters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DynamicMethodTypeWrapper.html" data-type="entity-link" >DynamicMethodTypeWrapper</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ElementalUiConfig.html" data-type="entity-link" >ElementalUiConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EntitySelect.html" data-type="entity-link" >EntitySelect</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExtendedObjectHistoryEvent.html" data-type="entity-link" >ExtendedObjectHistoryEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FilteredColumnOption.html" data-type="entity-link" >FilteredColumnOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FilterFormState.html" data-type="entity-link" >FilterFormState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FilterTreeParameter.html" data-type="entity-link" >FilterTreeParameter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FilterWizardSidesheetData.html" data-type="entity-link" >FilterWizardSidesheetData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FkCandidatesData.html" data-type="entity-link" >FkCandidatesData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ForeignKeyPickerData.html" data-type="entity-link" >ForeignKeyPickerData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ForeignKeySelection.html" data-type="entity-link" >ForeignKeySelection</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GroupInfoLoadParameters.html" data-type="entity-link" >GroupInfoLoadParameters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GroupPaginatorInformation.html" data-type="entity-link" >GroupPaginatorInformation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HvCell.html" data-type="entity-link" >HvCell</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HvElement.html" data-type="entity-link" >HvElement</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HvSettings.html" data-type="entity-link" >HvSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HyperViewLayout.html" data-type="entity-link" >HyperViewLayout</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IColumn.html" data-type="entity-link" >IColumn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IColumn-1.html" data-type="entity-link" >IColumn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IColumn-2.html" data-type="entity-link" >IColumn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IConnectorProvider.html" data-type="entity-link" >IConnectorProvider</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IExtension.html" data-type="entity-link" >IExtension</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/imx_ISearchService.html" data-type="entity-link" >imx_ISearchService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InteractiveParameter.html" data-type="entity-link" >InteractiveParameter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISessionState.html" data-type="entity-link" >ISessionState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISqlNodeView.html" data-type="entity-link" >ISqlNodeView</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/JobQueueDataSlice.html" data-type="entity-link" >JobQueueDataSlice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/JobQueueGroups.html" data-type="entity-link" >JobQueueGroups</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/KeyData.html" data-type="entity-link" >KeyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LayoutResult.html" data-type="entity-link" >LayoutResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MastHeadMenu.html" data-type="entity-link" >MastHeadMenu</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MastHeadMenuItem.html" data-type="entity-link" >MastHeadMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuItem.html" data-type="entity-link" >MenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Message.html" data-type="entity-link" >Message</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MessageParameter.html" data-type="entity-link" >MessageParameter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NavigationCommandsMenuItem.html" data-type="entity-link" >NavigationCommandsMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NodeCheckedChange.html" data-type="entity-link" >NodeCheckedChange</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NumberError.html" data-type="entity-link" >NumberError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ObjectHistoryParameters.html" data-type="entity-link" >ObjectHistoryParameters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OpsupportDbObjectParameters.html" data-type="entity-link" >OpsupportDbObjectParameters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParameterizedText.html" data-type="entity-link" >ParameterizedText</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParameterReplacement.html" data-type="entity-link" >ParameterReplacement</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RelatedApplication.html" data-type="entity-link" >RelatedApplication</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RouteConfig.html" data-type="entity-link" >RouteConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RowHighlight.html" data-type="entity-link" >RowHighlight</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SearchResultAction.html" data-type="entity-link" >SearchResultAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SelectContentProvider.html" data-type="entity-link" >SelectContentProvider</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SelectedElementsDialogParameter.html" data-type="entity-link" >SelectedElementsDialogParameter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/selectedFiltersParams.html" data-type="entity-link" >selectedFiltersParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShapeClickArgs.html" data-type="entity-link" >ShapeClickArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShownClientPropertiesArg.html" data-type="entity-link" >ShownClientPropertiesArg</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SideNavigationComponent.html" data-type="entity-link" >SideNavigationComponent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SideNavigationExtension.html" data-type="entity-link" >SideNavigationExtension</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SideNavigationItem.html" data-type="entity-link" >SideNavigationItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Size.html" data-type="entity-link" >Size</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StatusSession.html" data-type="entity-link" >StatusSession</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SystemUsers.html" data-type="entity-link" >SystemUsers</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TabData.html" data-type="entity-link" >TabData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TabItem.html" data-type="entity-link" >TabItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TextContainer.html" data-type="entity-link" >TextContainer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TextToken.html" data-type="entity-link" >TextToken</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimelineDateTimeFilter.html" data-type="entity-link" >TimelineDateTimeFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimelineEventsGroupedByDate.html" data-type="entity-link" >TimelineEventsGroupedByDate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TranslationConfiguration.html" data-type="entity-link" >TranslationConfiguration</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TreeNodeInfo.html" data-type="entity-link" >TreeNodeInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TreeNodeResultParameter.html" data-type="entity-link" >TreeNodeResultParameter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TypedEntityCandidateSidesheetParameter.html" data-type="entity-link" >TypedEntityCandidateSidesheetParameter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TypedEntityFkData.html" data-type="entity-link" >TypedEntityFkData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TypedEntitySelectionData.html" data-type="entity-link" >TypedEntitySelectionData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TypedEntityTableFilter.html" data-type="entity-link" >TypedEntityTableFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TypedEntityTableFilter-1.html" data-type="entity-link" >TypedEntityTableFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValueHasChangedEventArg.html" data-type="entity-link" >ValueHasChangedEventArg</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValueWrapper.html" data-type="entity-link" >ValueWrapper</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});