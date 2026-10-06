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
 * Copyright 2026 One Identity LLC.
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

import { DateFormat, ValType } from '@imx-modules/imx-qbm-dbts';
import { EntityColumnContainer } from '../entity-column-container';
import { ImxTranslationProviderService } from '../../translation/imx-translation-provider.service';
import { ViewPropertyComponent } from './view-property.component';

describe('ViewPropertyComponent', () => {
  const translation = { CultureFormat: 'en-US' } as unknown as ImxTranslationProviderService;

  function build(container: Partial<EntityColumnContainer>): ViewPropertyComponent {
    const component = new ViewPropertyComponent(translation);
    component.columnContainer = container as EntityColumnContainer;
    component.defaultValue = '#LDS#Not set';
    return component;
  }

  function dateContainer(opts: {
    value: unknown;
    displayValue?: string;
    dateFormat?: DateFormat;
  }): Partial<EntityColumnContainer> {
    return {
      type: ValType.Date,
      value: opts.value as any,
      displayValue: opts.displayValue,
      metaData: {
        GetDateFormat: () => opts.dateFormat,
      } as any,
    };
  }

  it('prefers the server-supplied DisplayValue for a Date-only column (CR-108653)', () => {
    const c = build(
      dateContainer({
        value: '2000-02-20T00:00:00Z',
        displayValue: '20-2-2000',
        dateFormat: DateFormat.Date,
      }),
    );

    expect(c.displayedValue).toBe('20-2-2000');
    expect(c.displayedValue).not.toMatch(/[0-9]:[0-9]/);
  });

  it('prefers the server-supplied DisplayValue for a DateTime column', () => {
    const c = build(
      dateContainer({
        value: '2000-02-20T00:00:00Z',
        displayValue: '2/20/2000, 1:00:00 AM',
        dateFormat: DateFormat.DateTime,
      }),
    );

    expect(c.displayedValue).toBe('2/20/2000, 1:00:00 AM');
  });

  it('falls back to toLocaleDateString for a Date-only column when displayValue is absent', () => {
    const c = build(
      dateContainer({
        value: '2000-02-20T00:00:00Z',
        displayValue: undefined,
        dateFormat: DateFormat.Date,
      }),
    );

    expect(c.displayedValue).toBe(new Date('2000-02-20T00:00:00Z').toLocaleDateString('en-US'));
    expect(c.displayedValue).not.toMatch(/[0-9]:[0-9]/);
  });

  it('falls back to toLocaleString for a DateTime column when displayValue is absent', () => {
    const c = build(
      dateContainer({
        value: '2000-02-20T00:00:00Z',
        displayValue: undefined,
        dateFormat: DateFormat.DateTime,
      }),
    );

    expect(c.displayedValue).toBe(new Date('2000-02-20T00:00:00Z').toLocaleString('en-US'));
  });

  it('falls back to toUTCString for a UtcDateTime column when displayValue is absent', () => {
    const c = build(
      dateContainer({
        value: '2000-02-20T00:00:00Z',
        displayValue: undefined,
        dateFormat: DateFormat.UtcDateTime,
      }),
    );

    expect(c.displayedValue).toBe(new Date('2000-02-20T00:00:00Z').toUTCString());
  });

  it('falls back to toLocaleString when DateFormat metadata is missing (unchanged legacy behavior)', () => {
    const c = build(
      dateContainer({
        value: '2000-02-20T00:00:00Z',
        displayValue: undefined,
        dateFormat: undefined,
      }),
    );

    expect(c.displayedValue).toBe(new Date('2000-02-20T00:00:00Z').toLocaleString('en-US'));
  });

  it('returns defaultValue for a Date column with a null value and no displayValue', () => {
    const c = build(
      dateContainer({
        value: null,
        displayValue: undefined,
        dateFormat: DateFormat.Date,
      }),
    );

    expect(c.displayedValue).toBe('#LDS#Not set');
  });

  it('returns defaultValue for a Date column whose value cannot be parsed', () => {
    const c = build(
      dateContainer({
        value: 'not-a-date',
        displayValue: undefined,
        dateFormat: DateFormat.Date,
      }),
    );

    expect(c.displayedValue).toBe('#LDS#Not set');
  });

  it('uses displayValue for non-Date types (unchanged behavior)', () => {
    const c = build({
      type: ValType.String,
      value: 'raw-value' as any,
      displayValue: 'Rendered',
    });

    expect(c.displayedValue).toBe('Rendered');
  });

  it('returns defaultValue when column container is undefined', () => {
    const c = new ViewPropertyComponent(translation);
    c.defaultValue = '#LDS#Not set';

    expect(c.displayedValue).toBe('#LDS#Not set');
  });
});
