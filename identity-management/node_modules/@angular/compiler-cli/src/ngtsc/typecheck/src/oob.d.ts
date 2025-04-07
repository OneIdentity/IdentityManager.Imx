/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { BindingPipe, PropertyRead, PropertyWrite, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstElement, TmplAstForLoopBlock, TmplAstForLoopBlockEmpty, TmplAstHoverDeferredTrigger, TmplAstIfBlockBranch, TmplAstInteractionDeferredTrigger, TmplAstLetDeclaration, TmplAstReference, TmplAstSwitchBlockCase, TmplAstTemplate, TmplAstVariable, TmplAstViewportDeferredTrigger } from '@angular/compiler';
import ts from 'typescript';
import { ClassDeclaration } from '../../reflection';
import { TemplateDiagnostic, TypeCheckId } from '../api';
import { TypeCheckSourceResolver } from './tcb_util';
/**
 * Collects `ts.Diagnostic`s on problems which occur in the template which aren't directly sourced
 * from Type Check Blocks.
 *
 * During the creation of a Type Check Block, the template is traversed and the
 * `OutOfBandDiagnosticRecorder` is called to record cases when a correct interpretation for the
 * template cannot be found. These operations create `ts.Diagnostic`s which are stored by the
 * recorder for later display.
 */
export interface OutOfBandDiagnosticRecorder {
    readonly diagnostics: ReadonlyArray<TemplateDiagnostic>;
    /**
     * Reports a `#ref="target"` expression in the template for which a target directive could not be
     * found.
     *
     * @param id the type-checking ID of the template which contains the broken reference.
     * @param ref the `TmplAstReference` which could not be matched to a directive.
     */
    missingReferenceTarget(id: TypeCheckId, ref: TmplAstReference): void;
    /**
     * Reports usage of a `| pipe` expression in the template for which the named pipe could not be
     * found.
     *
     * @param id the type-checking ID of the template which contains the unknown pipe.
     * @param ast the `BindingPipe` invocation of the pipe which could not be found.
     */
    missingPipe(id: TypeCheckId, ast: BindingPipe): void;
    /**
     * Reports usage of a pipe imported via `@Component.deferredImports` outside
     * of a `@defer` block in a template.
     *
     * @param id the type-checking ID of the template which contains the unknown pipe.
     * @param ast the `BindingPipe` invocation of the pipe which could not be found.
     */
    deferredPipeUsedEagerly(id: TypeCheckId, ast: BindingPipe): void;
    /**
     * Reports usage of a component/directive imported via `@Component.deferredImports` outside
     * of a `@defer` block in a template.
     *
     * @param id the type-checking ID of the template which contains the unknown pipe.
     * @param element the element which hosts a component that was defer-loaded.
     */
    deferredComponentUsedEagerly(id: TypeCheckId, element: TmplAstElement): void;
    /**
     * Reports a duplicate declaration of a template variable.
     *
     * @param id the type-checking ID of the template which contains the duplicate
     * declaration.
     * @param variable the `TmplAstVariable` which duplicates a previously declared variable.
     * @param firstDecl the first variable declaration which uses the same name as `variable`.
     */
    duplicateTemplateVar(id: TypeCheckId, variable: TmplAstVariable, firstDecl: TmplAstVariable): void;
    requiresInlineTcb(id: TypeCheckId, node: ClassDeclaration): void;
    requiresInlineTypeConstructors(id: TypeCheckId, node: ClassDeclaration, directives: ClassDeclaration[]): void;
    /**
     * Report a warning when structural directives support context guards, but the current
     * type-checking configuration prohibits their usage.
     */
    suboptimalTypeInference(id: TypeCheckId, variables: TmplAstVariable[]): void;
    /**
     * Reports a split two way binding error message.
     */
    splitTwoWayBinding(id: TypeCheckId, input: TmplAstBoundAttribute, output: TmplAstBoundEvent, inputConsumer: ClassDeclaration, outputConsumer: ClassDeclaration | TmplAstElement): void;
    /** Reports required inputs that haven't been bound. */
    missingRequiredInputs(id: TypeCheckId, element: TmplAstElement | TmplAstTemplate, directiveName: string, isComponent: boolean, inputAliases: string[]): void;
    /**
     * Reports accesses of properties that aren't available in a `for` block's tracking expression.
     */
    illegalForLoopTrackAccess(id: TypeCheckId, block: TmplAstForLoopBlock, access: PropertyRead): void;
    /**
     * Reports deferred triggers that cannot access the element they're referring to.
     */
    inaccessibleDeferredTriggerElement(id: TypeCheckId, trigger: TmplAstHoverDeferredTrigger | TmplAstInteractionDeferredTrigger | TmplAstViewportDeferredTrigger): void;
    /**
     * Reports cases where control flow nodes prevent content projection.
     */
    controlFlowPreventingContentProjection(id: TypeCheckId, category: ts.DiagnosticCategory, projectionNode: TmplAstElement | TmplAstTemplate, componentName: string, slotSelector: string, controlFlowNode: TmplAstIfBlockBranch | TmplAstSwitchBlockCase | TmplAstForLoopBlock | TmplAstForLoopBlockEmpty, preservesWhitespaces: boolean): void;
    /** Reports cases where users are writing to `@let` declarations. */
    illegalWriteToLetDeclaration(id: TypeCheckId, node: PropertyWrite, target: TmplAstLetDeclaration): void;
    /** Reports cases where users are accessing an `@let` before it is defined.. */
    letUsedBeforeDefinition(id: TypeCheckId, node: PropertyRead, target: TmplAstLetDeclaration): void;
    /**
     * Reports a `@let` declaration that conflicts with another symbol in the same scope.
     *
     * @param id the type-checking ID of the template which contains the declaration.
     * @param current the `TmplAstLetDeclaration` which is invalid.
     */
    conflictingDeclaration(id: TypeCheckId, current: TmplAstLetDeclaration): void;
}
export declare class OutOfBandDiagnosticRecorderImpl implements OutOfBandDiagnosticRecorder {
    private resolver;
    private _diagnostics;
    /**
     * Tracks which `BindingPipe` nodes have already been recorded as invalid, so only one diagnostic
     * is ever produced per node.
     */
    private recordedPipes;
    constructor(resolver: TypeCheckSourceResolver);
    get diagnostics(): ReadonlyArray<TemplateDiagnostic>;
    missingReferenceTarget(id: TypeCheckId, ref: TmplAstReference): void;
    missingPipe(id: TypeCheckId, ast: BindingPipe): void;
    deferredPipeUsedEagerly(id: TypeCheckId, ast: BindingPipe): void;
    deferredComponentUsedEagerly(id: TypeCheckId, element: TmplAstElement): void;
    duplicateTemplateVar(id: TypeCheckId, variable: TmplAstVariable, firstDecl: TmplAstVariable): void;
    requiresInlineTcb(id: TypeCheckId, node: ClassDeclaration): void;
    requiresInlineTypeConstructors(id: TypeCheckId, node: ClassDeclaration, directives: ClassDeclaration[]): void;
    suboptimalTypeInference(id: TypeCheckId, variables: TmplAstVariable[]): void;
    splitTwoWayBinding(id: TypeCheckId, input: TmplAstBoundAttribute, output: TmplAstBoundEvent, inputConsumer: ClassDeclaration, outputConsumer: ClassDeclaration | TmplAstElement): void;
    missingRequiredInputs(id: TypeCheckId, element: TmplAstElement | TmplAstTemplate, directiveName: string, isComponent: boolean, inputAliases: string[]): void;
    illegalForLoopTrackAccess(id: TypeCheckId, block: TmplAstForLoopBlock, access: PropertyRead): void;
    inaccessibleDeferredTriggerElement(id: TypeCheckId, trigger: TmplAstHoverDeferredTrigger | TmplAstInteractionDeferredTrigger | TmplAstViewportDeferredTrigger): void;
    controlFlowPreventingContentProjection(id: TypeCheckId, category: ts.DiagnosticCategory, projectionNode: TmplAstElement | TmplAstTemplate, componentName: string, slotSelector: string, controlFlowNode: TmplAstIfBlockBranch | TmplAstSwitchBlockCase | TmplAstForLoopBlock | TmplAstForLoopBlockEmpty, preservesWhitespaces: boolean): void;
    illegalWriteToLetDeclaration(id: TypeCheckId, node: PropertyWrite, target: TmplAstLetDeclaration): void;
    letUsedBeforeDefinition(id: TypeCheckId, node: PropertyRead, target: TmplAstLetDeclaration): void;
    conflictingDeclaration(id: TypeCheckId, decl: TmplAstLetDeclaration): void;
}
