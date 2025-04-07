/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { AbsoluteSourceSpan, ParseSourceFile, ParseSourceSpan } from '@angular/compiler';
import ts from 'typescript';
import { TypeCheckId, SourceMapping } from '../api';
import { TypeCheckSourceResolver } from './tcb_util';
/**
 * Represents the source of a template that was processed during type-checking. This information is
 * used when translating parse offsets in diagnostics back to their original line/column location.
 */
export declare class TemplateSource {
    readonly mapping: SourceMapping;
    private file;
    private lineStarts;
    constructor(mapping: SourceMapping, file: ParseSourceFile);
    toParseSourceSpan(start: number, end: number): ParseSourceSpan;
    private toParseLocation;
    private acquireLineStarts;
}
/**
 * Assigns IDs for type checking and keeps track of their origins.
 *
 * Implements `TypeCheckSourceResolver` to resolve the source of a template based on these IDs.
 */
export declare class DirectiveSourceManager implements TypeCheckSourceResolver {
    /**
     * This map keeps track of all template sources that have been type-checked by the id that is
     * attached to a TCB's function declaration as leading trivia. This enables translation of
     * diagnostics produced for TCB code to their source location in the template.
     */
    private templateSources;
    getTypeCheckId(node: ts.ClassDeclaration): TypeCheckId;
    captureTemplateSource(id: TypeCheckId, mapping: SourceMapping, file: ParseSourceFile): void;
    getTemplateSourceMapping(id: TypeCheckId): SourceMapping;
    toTemplateParseSourceSpan(id: TypeCheckId, span: AbsoluteSourceSpan): ParseSourceSpan | null;
}
