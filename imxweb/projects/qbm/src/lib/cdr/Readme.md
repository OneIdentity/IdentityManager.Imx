# CDR: **C**olumn **D**ependent **R**eference
The classes and interfaces in the cdr module supply the possibility to
dynamically include UI components that allow editing of entity properties.

The name *CDR* refers to the fact that those editor components are not included
directly in the code but instead *referenced* indirectly.
This indirect reference will be <u>resolved</u> to an editor <u>at runtime</u>.
What editor component this will be exactly in the end *depends* on the
*column* and its meta-data.

## The registry: resolving CDRs to editors
Generally, when you want to include an editor for a column dependent reference,
you make use of the [CdrEditorComponent](cdr-editor\cdr-editor.component.ts), which provides a convenient tag that
you can include in a template: <tt>imx-cdr-editor</tt>.

E.g.
```html
<h2>Resulting Editor</h2>
<imx-cdr-editor [cdr]="cdr"></imx-cdr-editor>
```

The CdrEditorComponent works pretty straight forward. It takes the given CDR,
asks the registry to resolve it to the appropriate editor component,
which then will replace CdrEditorComponent's view.

So the real CDR editor resolution happens within the [CdrRegistryService](cdr-registry.service.ts).
This service allows to register plugins that can supply editor components for CDR.
When asked to resolve a CDR to an editor, it delegates that task to the registered plugins.
The first plugin that can supply an editor wins this race.
If none of the registered plugins was able to supply an editor the registry
resolves to a EditDefaultComponent.

The registry askes the registered plugins in FILO fashion, so that the plugins registered first,
will be the last to be asked. This order was chosen assuming that the more appliation specific a module is 
* the later it will be initialized and
* the more likely it can provide a specialized CDR editor.

## Out-of-the-box CDR editors
As mentioned above, the CdrRegistryService solely supplies a single fallback editor out of the box: [EditDefaultComponent](edit-default/edit-default.component.ts).

All other editors have to be provided by plugins that register at the CdrRegistryService.

Nevertheless within the CDR module there are two plugins that supply some general default editors.

[DefaultCdrEditorProvider](default-cdr-editor-provider.ts) provided editors:
* [EditBooleanComponent](edit-boolean/edit-boolean.component.ts): for boolean properties
* [EditLimitedValueComponent](edit-limited-value/edit-limited-value.component.ts): for properties where the value can be one of a limited set of allowed values
* [EditMultiLimitedValueComponent](edit-multi-limited-value/edit-multi-limited-value.component.ts): for properties where the value can be one or many of a limited set of alowed values
* [EditMulitValueComponent](edit-multi-value/edit-multi-value.component.ts)
* [EditMultiLineComponent](edit-multiline/edit-multiline.component.ts): for text properties that allow multiple lines
* [EditNumberComponent](edit-number/edit-number.component.ts): for numeric properties

[FkCdrEditorProvider](fk-cdr-editor-provider.ts) provided editors:
* [EditFkComponent](edit-fk/edit-fk.component.ts): for foreign key properties, i.e. properties pointing to other entities, e.g. "primary department" property of a person

If you want to make use of these two provider services you have to register them at the CdrRegistryService, e.g. during your app's initialization like this:
```typescript
export function initApp(registry: CdrRegistryService) {
  return () =>
    new Promise<any>(async (resolve: any) => {
      registry.register(new DefaultCdrEditorProvider());
      registry.register(new FkCdrEditorProvider());
      resolve();
    });
}
```

## Providing custom CDR editors
First thing you have to do is to create an editor component.
Second thing is to create a provider class that must be registered at the CdrRegistryService.

### Creating a CDR editor component
A CDR editor is just a normal Angular UI component that implements a certain interface: [CdrEditor](cdr-editor.interface.ts)

This interface defines a method that should be called by the provider to tell the editor which column dependent reference it should display/edit:
```typescript
bind(cdref: ColumnDependentReference)
```

### Creating a CDR editor provider
A CDR editor provider is a class implementing the [CdrEditorProvider](cdr-editor-provider.interface.ts) interface.
Although not necessary it is a good choice to make this class an Angular service.

The interface allows to supply multiple different editor types
but if you want to supply instances of a single editor class only, 
there is a convenient abstract base class that you can inherit from: [BaseCdrEditorProvider](base-cdr-editor-provider.ts)

When you inherit from BaseCdrEditorProvider the only method you have to implement is
the one that 'accepts' a given column dependent reference, i.e. whether the provided editor fits for it.
```typescript
protected abstract accept(cdref: ColumnDependentReference): boolean;
```