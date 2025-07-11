# UI texts and translation

In this section you can find information about components that are used to display UI texts in different languages to the user.

## Messages

### User messages

User messages are displayed using the [`UserMessageComponent`](../src/lib/user-message/user-message.component.ts) which renders/uses an Elemental UI alert component.

### Message dialog

The message dialog is defined in the [`MessageDialogComponent`](../src/lib/message-dialog/message-dialog.component.ts). It can display the same information the normal [`UserMessageComponent`](../src/lib/user-message/user-message.component.ts) is showing, but it uses an Angular Material dialog instead.

### Confirmation dialog

The confirmation dialog is opened using the [`ConfirmationService`](../src/lib/confirmation/confirmation.service.ts). It allows the user to confirm a specific action (for example, deleting an object).

### Snackbar

To display a small notification the Angular [`SnackBarService`](../src/lib/snackbar/snack-bar.service.ts) can be used.

### Logging

To send messages to the command line, the special [ClassLoggerService](../src/lib/classlogger/classlogger.service.ts) can be used.

### Error handling

Error handling is handled by the [`GlobalErrorHandler`](../src/lib/base/global-error-handler.ts).

---

## Translation

The libraries are using translatable keys, identifiable by the prefix `#LDS#`. The following services are needed to translate these keys into localized text at runtime.

### Translation service

To initialize the translation information, the [`ImxTranslationProviderService`](../src/lib/translation/imx-translation-provider.service.ts) is used. You can use this service for translation purposes, but it is recommended to use the `TranslateService` from `@ngx-translate`, which is used in this service anyway.

### LDS replace

The [`LdsReplaceModule`](../src/lib/lds-replace/lds-replace.module.ts) contains a [`LdsReplacePipe`](../src/lib/lds-replace/lds-replace.pipe.ts) class which can be used to replace placeholders inside LDS key translations.

### Parameterized text

The [`ParameterizedTextModule`](../src/lib/parameterized-text/parameterized-text.module.ts) provides components and services to display a parameterized text that emphasizes it's parameters. The UI is defined in the [`ParameterizedTextComponent`](../src/lib/parameterized-text/parameterized-text.component.ts).

### Translation editor

The [`TranslationEditorComponent`](../src/lib/translation-editor/translation-editor.component.ts) can be used to to add translations to an LDS key.
