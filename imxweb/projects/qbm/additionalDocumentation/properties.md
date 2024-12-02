# Properties of an object

In this section you can find information about components that can be used to edit properties of an entity (`IEntity`).

To edit properties of entities you can use:
- **C**olumn-**D**ependent **R**eferences (CDR) \
CDRs are listed in the `cdr` folder of this project. \
Typically, CDRs are represented in templates with the `<imx-cdr-editor>` tag. For more information about this component, see [CdrEditorComponent](../../components/CdrEditorComponent.html).
- the [`EntityColumnEditorComponent`](../../components/EntityColumnEditorComponent.html) that wraps the editor

The correct definition of an editor is determined by the information provided by the CDR. \
For this, it is necessary to register the components. The predefined components are registered in the [`DefaultCdrEditorProvider`](../../classes/DefaultCdrEditorProvider.html) and the [`FkCdrEditorProvider`](../../classes/FkCdrEditorProvider.html).

The following property types have predefined editors, that can also be displayed as read-only:
* [boolean](../../components/EditBooleanComponent.html) 
* [date](../../components/EditDateComponent.html)
* [date range](../../components/DateRangeComponent.html)
* [foreign-key definition](../../components/EditFkComponent.html)
* [image](../../components/EditImageComponent.html)
* [limited value](../../components/EditLimitedValueComponent.html)
* [multi foreign-key definition](../../components/EditFkMultiComponent.html)
* [multi-limited value](../../components/EditMultiLimitedValueComponent.html)
* [multi-line string](../../components/EditMultilineComponent.html)
* [multi value](../../components/EditMultiValueComponent.html)
* [number](../../components/EditNumberComponent.html)
* [risk index](../../components/EditRiskIndexComponent.html)
* [simple string](../../components/EditDefaultComponent.html)
* [url](../../components/EditUrlComponent.html)

