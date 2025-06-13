# Properties of an object

In this section you can find information about components that can be used to edit properties of an entity (`IEntity`).

To edit properties of entities you can use:

- **C**olumn-**D**ependent **R**eferences (CDR) \
  CDRs are listed in the `cdr` folder of this project. \
  Typically, CDRs are represented in templates with the `<imx-cdr-editor>` tag. For more information about this component, see [CdrEditorComponent](../src/lib/cdr/cdr-editor/cdr-editor.component.ts).
- the [`EntityColumnEditorComponent`](../src/lib/cdr/entity-column-editor/entity-column-editor.component.ts) that wraps the editor

The correct definition of an editor is determined by the information provided by the CDR. \
For this, it is necessary to register the components. The predefined components are registered in the [`DefaultCdrEditorProvider`](../src/lib/cdr/default-cdr-editor-provider.ts) and the [`FkCdrEditorProvider`](../src/lib/cdr/fk-cdr-editor-provider.ts).

The following property types have predefined editors, that can also be displayed as read-only:

- [boolean](../src/lib/cdr/edit-boolean/edit-boolean.component.ts)
- [date](../src/lib/cdr/edit-date/edit-date.component.ts)
- [date range](../src/lib/cdr/date-range/date-range.component.ts)
- [foreign-key definition](../src/lib/cdr/)
- [image](../src/lib/cdr/edit-image/edit-image.component.ts)
- [limited value](../src/lib/cdr/edit-limited-value/edit-limited-value.component.ts)
- [multi foreign-key definition](../src/lib/cdr/edit-fk/edit-fk-multi.component.ts)
- [multi-limited value](../src/lib/cdr/edit-multi-limited-value/edit-multi-limited-value.component.ts)
- [multi-line string](../src/lib/cdr/edit-multiline/edit-multiline.component.ts)
- [multi value](../src/lib/cdr/edit-multi-value/edit-multi-value.component.ts)
- [number](../src/lib/cdr/edit-number/edit-number.component.ts)
- [risk index](../src/lib/cdr/edit-risk-index/edit-risk-index.component.ts)
- [simple string](../src/lib/cdr/edit-default/edit-default.component.ts)
- [url](../src/lib/cdr/edit-url/edit-url.component.ts)
