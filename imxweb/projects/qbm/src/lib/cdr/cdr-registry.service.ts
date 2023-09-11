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

import { Injectable, ErrorHandler, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';

import { CdrEditorProviderRegistry } from './cdr-editor-provider-registry.interface';
import { CdrEditorProvider } from './cdr-editor-provider.interface';
import { ColumnDependentReference } from './column-dependent-reference.interface';
import { CdrEditor } from './cdr-editor.interface';
import { EditDefaultComponent } from './edit-default/edit-default.component';
import { ClassloggerService } from '../classlogger/classlogger.service';

/**
 * A service that is capable of {@link create|creating} an {@link CdrEditor|editor}
 * for a given {@link ColumnDependentReference|column dependent reference}
 * by delegating to {@link register|registered} {@link CdrEditorProvider|editor providers}.
 *
 * @see create
 * @see register
 * @see CdrEditor
 * @see ColumnDependentReference
 * @see CdrEditorProvider
 */
@Injectable({
  providedIn: 'root'
})
export class CdrRegistryService implements CdrEditorProviderRegistry {

  /**
   * This array contains the registered (@see register) providers.
   */
  private readonly registeredProviders: CdrEditorProvider[] = [];

  /**
   * Creates a new registry service for column dependent reference editor providers.
   * @param componentFactoryResolver The resolver required for resolving the factory capable of creating an editor component
   * @param errorHandler Required error handler to handle errors.
   * @param logger The logger used for logging messages
   * @throws {Error} Throws an error if the given error handler is null or undefined.
   */
  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private errorHandler: ErrorHandler, private logger: ClassloggerService) { }

  /**
   * Registers an editor provider for column dependent references.
   *
   * @param provider The editor provider to register
   * @throws {Error} Throws an error if the given provider is null or undefined.
   * @throws {Error} Throws an error if the given provider has already been registered.
   */
  public register(provider: CdrEditorProvider): void {
    if (provider == null) {
      throw new Error('The provider must not be null or undefined.');
    }

    if (this.registeredProviders.find(p => p === provider)) {
      throw new Error('This provider has already been registered.');
    }

    this.logger.debug(this, `Registering '${this.className(provider)}' as
    column dependent reference editor provider #${this.registeredProviders.length + 1}.`);
    this.registeredProviders.push(provider);
  }

  /**
   * Creates an editor for the given column dependent reference.
   *
   * In order to do so, all registered (@see register) providers will be asked to
   * create an editor for the given column dependent reference in REVERSE order
   * and the first non null/undefined editor will be taken as result.
   *
   * Providers that return an undefined or null editor will be skipped as well
   * as editors that run into an error.
   *
   * If none of the registered providers could create an editor the return value will be undefined.
   *
   * @param cdref The column dependent reference for which an editor shall be created
   * @throws {Error} Throws an error if the given column dependent reference is null or undefined.
   */
  public createEditor(parent: ViewContainerRef, cdref: ColumnDependentReference): ComponentRef<CdrEditor> {
    if (cdref == null) {
      throw new Error('The cdref must not be null or undefined.');
    }

    this.logger.debug(this, `Creating editor for column dependent reference '${this.className(cdref)}'.`);
    for (const provider of this.registeredProviders.slice().reverse()) {
      this.logger.debug(this, `Asking editor provider '${this.className(provider)}' to create editor for '${this.className(cdref)}'`);

      try {
        const editor = provider.createEditor(parent, cdref);

        if (!editor) {
          this.logger.debug(this, `Provider '${this.className(provider)}' returned '${this.className(editor)}'
           for '${this.className(cdref)}' -> skipping it.'`);
        } else {
          this.logger.debug(this, `Returning editor '${this.className(editor.instance)}'
           for '${this.className(cdref)}' created by '${this.className(provider)}'.`);
          return editor;
        }
      } catch (e) {
        this.logger.error(this, `Error during attempt to create editor through provider ${this.className(provider)}
         -> skipping the provider this time.`, e);
        this.errorHandler.handleError(e);
      }
    }

    this.logger.debug(this, `None of the providers could create an editor for '${this.className(cdref)}' -> returning default editor.`);
    try {
      const component = parent.createComponent(this.componentFactoryResolver.resolveComponentFactory(EditDefaultComponent));
      component.instance.bind(cdref);
      return component;
    } catch (e) {
      this.logger.error(this, 'Error during attempt to create default editor --> returning null', e);
      this.errorHandler.handleError(e);
      return null;
    }
  }

  private className(obj: any): string {
    try {
      return obj.constructor.name;
    } catch (e) {
      return '';
    }
  }
}
