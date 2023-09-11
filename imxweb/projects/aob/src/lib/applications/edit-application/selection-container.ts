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

export class SelectionContainer<T> {
    public selected: T[] = [];

    private assigned: T[] = [];

    constructor(private getKey: (item: T) => string) { }

    public init(assigned: T[]): void {
        this.assigned = assigned;
        this.selected = assigned.slice();
    }

    public getChangeSet(): { add: T[], remove: T[] } {
      return {
        add: this.selected.filter(item => this.assigned.find(itemAssigned => this.equals(item, itemAssigned)) == null),
        remove: this.selected == null || this.selected.length === 0 ?
            this.assigned :
            this.assigned.filter(itemAssigned => this.selected.find(item => this.equals(item, itemAssigned)) == null)
      };
    }

    private equals(item1: T, item2: T): boolean {
        return this.getKey(item1) === this.getKey(item2);
    }
}
