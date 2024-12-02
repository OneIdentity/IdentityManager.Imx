# UI texts and translation
In this section you can find information about components that are used to display UI texts in different languages to the user.

## Messages

### User messages
User messages are displayed using the [`UserMessageComponent`](../../components/UserMessageComponent.html) which renders/uses an Elemental UI alert component.

### Message dialog
The message dialog is defined in the [`MessageDialogComponent`](../../components/MessageDialogComponent.html). It can display the same information the normal [`UserMessageComponent`](../../components/UserMessageComponent.html) is showing, but it uses an Angular Material dialog instead.

[`MessageDialogComponent`](../../components/MessageDialogComponent.html) is part of the [`QbmModule`](../../modules/QbmModule.html).

### Confirmation dialog
The confirmation dialog is opened using the [`ConfirmationService`](../../injectables/ConfirmationService.html). It allows the user to confirm a specific action (for example, deleting an object).

### Snackbar
To display a small notification the Angular [`SnackBarService`](../../injectables/SnackBarService.html) can be used.

### Logging
To send messages to the command line, the special [ClassLoggerService](../../injectables/ClassloggerService.html) can be used.

### Error handling
Error handling is handled by the [`GlobalErrorHandler`](../../injectables/GlobalErrorHandler.html).

---

## Translation
The libraries are using translatable keys, identifiable by the prefix `#LDS#`. The following services are needed to translate these keys into localized text at runtime.

### Translation service
To initialize the translation information, the [`ImxTranslationProviderService`](../../injectables/ImxTranslationProviderService.html) is used. You can use this service for translation purposes, but it is recommended to use the `TranslateService` from `@ngx-translate`, which is used in this service anyway.

### LDS replace
The [`LdsReplaceModule`](../../modules/LdsReplaceModule.html) contains a [`LdsReplacePipe`](../../injectables/LdsReplacePipe.html) class which can be used to replace placeholders inside LDS key translations.

### Parameterized text
The [`ParameterizedTextModule`](../../modules/ParameterizedTextModule.html) provides components and services to display a parameterized text that emphasizes it's parameters. The UI is defined in the [`ParameterizedTextComponent`](../../components/ParameterizedTextComponent.html).

### Translation editor
The [`TranslationEditorComponent`](../../components/TranslationEditorComponent.html) can be used to to add translations to an LDS key. It is declared in the [`QbmModule`](../../modules/QbmModule.html).