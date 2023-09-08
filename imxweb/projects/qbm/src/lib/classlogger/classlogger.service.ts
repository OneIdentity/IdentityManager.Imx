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

import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

/**
 * Service that wraps the NGXLogger to provide class name functionality
 * It provides the following methods from NGXLogger:
 *  error
 *  warn
 *  info
 *  log
 *  debug
 *  trace
 *
 * @example
 * Usage of simple logging, output is "Example: sample message 1 2"
 *
 * class Example {
 *  public testLogging(logger: ClassloggerService, value1:int = 1, value2:int = 2) {
 *    logger.log(this,'sample message',value1 , value2 );
 *  }
 * }
 *
 * @example
 * Usage of error logging, output is "Example: <errormessag>
 *
 * class Example {
 *  public testLogging(logger: ClassloggerService) {
 *    try {
 *       this.fetchFilename();
 *    } catch (e: Error) {
 *      logger.error(this, e);
 *    }
 *  }
 * }
 *
 */
@Injectable({
  providedIn: 'root'
})
export class ClassloggerService {

  constructor(private nativLogger: NGXLogger) {}

  /**
   * A method, that wraps the NGXLogger.log(message: any, ...additionalInfo: any[]) method
   * @param caller The instance of the class using the method
   * @param message The message to display
   * @param additionalInfo Additional informations that should be displayed
   */
  public log(caller: any, message: any, ...additionalInfo: any[]): void {
    additionalInfo.push(this.createCallerInfo(caller));
    this.nativLogger.log(message, ...additionalInfo);
  }

  /**
   * A method, that wraps the NGXLogger.debug(message: any, ...additionalInfo: any[]) method
   * @param caller The instance of the class using the method
   * @param message The message to display
   * @param additionalInfo Additional informations that should be displayed
   */
  public debug(caller: any, message: any, ...additionalInfo: any[]): void {
    additionalInfo.push(this.createCallerInfo(caller));
    this.nativLogger.debug(message, ...additionalInfo);
  }

  /**
   * A method, that wraps the NGXLogger.error(message: any, ...additionalInfo: any[]) method
   * @param caller The instance of the class using the method
   * @param message The message to display
   * @param additionalInfo Additional informations that should be displayed
   */
  public error(caller: any, message: any, ...additionalInfo: any[]): void {
    additionalInfo.push(this.createCallerInfo(caller));
    this.nativLogger.error(message, ...additionalInfo);
  }

  /**
   * A method, that wraps the NGXLogger.trace(message: any, ...additionalInfo: any[]) method
   * @param caller The instance of the class using the method
   * @param message The message to display
   * @param additionalInfo Additional informations that should be displayed
   */
  public trace(caller: any, message: any, ...additionalInfo: any[]): void {
    additionalInfo.push(this.createCallerInfo(caller));
    this.nativLogger.trace(message, ...additionalInfo);
  }

  /**
   * A method, that wraps the NGXLogger.warn(message: any, ...additionalInfo: any[]) method
   * @param caller The instance of the class using the method
   * @param message The message to display
   * @param additionalInfo Additional informations that should be displayed
   */
  public warn(caller: any, message: any, ...additionalInfo: any[]): void {
    additionalInfo.push(this.createCallerInfo(caller));
    this.nativLogger.warn(message, ...additionalInfo);
  }

  /**
   * A method, that wraps the NGXLogger.info(message: any, ...additionalInfo: any[]) method
   * @param caller The instance of the class using the method
   * @param message The message to display
   * @param additionalInfo Additional informations that should be displayed
   */
  public info(caller: any, message: any, ...additionalInfo: any[]): void {
    additionalInfo.push(this.createCallerInfo(caller));
    this.nativLogger.info(message, ...additionalInfo);
  }

  private createCallerInfo(caller: any): string {
    return `\nCaller: ${caller.constructor.name}`;
  }
}
