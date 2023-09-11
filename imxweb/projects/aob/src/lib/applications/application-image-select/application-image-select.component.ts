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

import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { IEntityColumn } from 'imx-qbm-dbts';
import { Base64ImageService, EntityColumnContainer } from 'qbm';
import { ImageSelectorDialogComponent } from './image-selector-dialog/image-selector-dialog.component';

@Component({
  selector: 'imx-application-image-select',
  templateUrl: './application-image-select.component.html',
  styleUrls: ['./application-image-select.component.scss']
})
export class ApplicationImageSelectComponent implements OnChanges, AfterViewInit {
  public readonly control = new UntypedFormControl();

  public readonly columnContainer = new EntityColumnContainer<string>();

  @Input() public column: IEntityColumn;

  @Output() public controlCreated = new EventEmitter<UntypedFormControl>();

  private readonly icons = {
    // tslint:disable-next-line:max-line-length
    application: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAlCAYAAAAA7LqSAAAAAXNSR0IArs4c6QAAAeJJREFUWAntWbFKA0EQde/CYSGk0SqIiEhEVNBW/YLkD4SQIsc1/oCVtZWlJLlK0C/w6ivE1kIiIiJcKgtttNKId74Jd7JcYrMwa052YZm5eTs782Z2mz0xhRGGYSmKohnSizaazeabECIWnU5nD8kfJ0kyVzQSlC9I9DFdCwSOdJNA4HfkcD+ucMC+YO+Nw1IbYXGGI/cFzEMLhkpm1CSfEHje87wVy7L25ZhEEFgV2DrsdRkj3bbtHcLgt5kSHi6BT4WIaB1I4ALJvFBQJHQK8VNd6JfAHgmDDLD2mfR0PLRarSvSXde9gbhO7UOhnQiqV2+327MUPY7jBoScwy6wJcIga1gr39tl3/e3Cet2uxsQW6RnQ8AhyT50yfQI9RGvmo9JRwYE7mBfG4MBSm5hX8WUCxCV8ot1fCOZacQZIUGxgdkQIyRSTPyG5YmcYOEBORVgnCHHWpZnnsgHLtlrBk6yxJX4lPOTz5lsL5xuiExay0xHTEeYKmCOFlNhlbc1HVEuHZOj6QhTYZW3NR1RLh2To+kIU2GVtzUdUS4dk6PpCFNhlbc1HVEuHZPjv+nInzyZMjQloo7Ir+EMMbRsGRORQEsoxiB4+A5KjuM0BoMBPe8vMsZi2xr/WHrlcvn8Gxm0iGtOIek+AAAAAElFTkSuQmCC',
    // tslint:disable-next-line:max-line-length
    box: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAABqklEQVRoQ+1YPUvDQBh+riSiBJRubo7FWXD1B7h3L4gHyWQGF62DH4tDnBo4Ebp39we4Cs7i6OZWFIJiQk4OtFiqJL3cBYnvrXnf573ng9wlDA1ZrCE8QET+mpPkCDliSQGKliVhtWHJEW3pLDU20xEhxApjbCvP83VLwhmBbbVa91LKG8758xfgxJHRaLQwHo9PAOwbmWYf5Lzdbve73e67GjUhEkXRkud5FwC4/T0YmSCSJNkLw/CViBjRszoIOVJdQ7MI5IhZPauj/ezIcDhcTNP0QEq5WX2GfQTG2K3rume9Xu9t6vVrf7TdCc28a9nVzC76r44IIfoAju2Onxv9iHOu7oMzi4jMraWZhloceQSwm6bpXZk9u667AeASwFqZ+s+aWohMHVBFm9P8bKiFyHWWZTtBEDwVkVDPB4PBquM4VwC2y9TX6Yia9QBARazMUpHqlCn8VlOLI3PuSauciNCBqBWc4iaKFkWrOCVaFRQtipZWcIqbKFoUreKUaFX842jFcdxxHOdUSrmspZ3hJsbYS5Zlh77vq0+FmUX/tQwLXhmuMY58ANUk7zNkl1kaAAAAAElFTkSuQmCC',
    // tslint:disable-next-line:max-line-length
    openfolder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAC80lEQVRoQ+2Zz2sTQRTHv28zadUiklp602tP4lH/AoUePElErYdQs1uSWmi9qNBa6UUKpoptdJtDD9KDVUEPRdSbJ68qiKIX9VoTtBRt2cyTDSQQJbNhmgnTkr0F9v34zHf2fWc3hF1y0S7hQAfENiU7inQUMbQCna1laGG109YpsrCwcEgIcZqZu3QzEtFWEASPs9nsd90cOnE1kJWVla5SqXQTwLhOon9i5hKJxJVkMrnVglxNpaiB5HK5vT09PXMAvKYi1Tf5Gxsb4xMTE79bkKupFKZAngK4J6U0oogQoiylfOd53s8qpSmQplZxmzfNJhKJyer23ckgddtXBfKVmR8BWNvmypkK/9bb2/skUhEiGnRd97mpLlqdt5Ei7wEkPc/72OqCpvI1AnlbLpfPZDKZT2Hh6elpp7+//4CU0jHViG7eeDweuK77KxKEmalQKIwx823dYobj1gFcigTxfX8fgDsALhpuSDs9M+cjQebn5w8KIZaJ6KR2JfOBU5Eg+Xx+IBaLPQRw1Hw/ehWIaCgSpFAoHJdSvgSwX6+M+ShmPhEJsri4eIqZn5lvR7vCuuM40SC+74fH+px2GfOBFatQKtLX1/elWCzOENFV8/3oVWDmF0EQnFeCxGKx8C3P6tEL4IEQIqsEkVKu2T56Qw/p7u6+rAQJxbZ99AKY8jxvRgkSj8cTto/e0ENc111WggghBiwfvQg9ZGRk5FXUwz5o+eiteEg6nX7TEISZzwEYsnn0Aqi9bjQEkVKmHMfJWH7qrXjI6OjoDxVIlogmLT/1VjxkeHh4XbW1rhPRDZtPvVUPSaVSf1Qgd4ko/PJo7am36iGh3zUEAbAK4JreCag9UVUPUYIQ0QdmPtuelvSqVD1EBfIZQBHAMb0SbYmqeYgKpC2dbLNI3Ser2jOytLS0Z3Nz8xYRhd6xE67Vcrl8IZPJlOoUCX/4vn8EwBiAw5aTFInofjqdfk1E/B+I5c0r2+v8q2ubeh1FOooYWoG/nVypz2zv/LMAAAAASUVORK5CYII=',
    // tslint:disable-next-line:max-line-length
    server: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAACM0lEQVRoQ+2ZMWvbUBDH717jOMWQYA8eswfSvdDQD1ACHQJa4sWLJAcSqAvdWkS7FeJCCrakxYuzCDIEQj5AaSB7Ct0zerBJwLSu23elpTG1ooCe7GfLL8+bhd7d/f7/QzpOCIr8UBEO0CBpc1I7kmpHPM97BAB7ALCatkJD9VwCwIFlWRc314et1Ww2l/r9/j4i7qQc4m95RFTPZrMvy+Xy9z//hyC1Wu1hLpf7AADWPIAAgNfr9V5Uq9VvIiA7nPOvYUDG2BoA1GcELg7COd+oVCpn4YIbjcYTxthnDTKeAuKOAIAarTWecNJOJ3JEWjVjBI4GCYJgsdPpbM3By/CG/bJQKBwZhvFj5PE7hjKpOKrm0Og4DisWiyucc5YKme8ogjHG2+32leM4/NasFQTBg263WwWA92mG+K+2V/l8vmYYxi+RESWNbOKPXyI6R8TrMA0RLSPi4xlRioPoWUuuVffYEbnCJo4u7kjiVHIPKg5CROj7/vJgMFiQK+RkomcymZ+maV4jIumhcTKaTjbKyPSrF3STFTdWNL2g0wu6WI2S6CbxF6Iy069e0CXqmNiHxFsrdujp3hhvQccYe0pEzyJqaxHRF5k1I+I6AJTCORDxlHP+6d/1eAs6z/NeA8DbiGAl0zQPZYL4vr9NRK2IHG8sy3oXlfvOBZ0yIK7r7iLiZsTmpG7b9rFMR1zXfR71LZOITmzb/ijkiMxCZcRWc/crQ6lpxdSOTEvpuHmUceQ3am+oQn9k2zIAAAAASUVORK5CYII=',
    // tslint:disable-next-line:max-line-length
    hdd: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAETklEQVRoQ+2ZTWhjVRTH/+e91kZSnSaLSgdk3MksdDcKulDQcasDQ1BnHJAmvYkfwWZRdKD6tDhKF4lUSt5LUgaGGUfCDKPoShwYEcWPhagL6U4XnWAXDWObmkjfO3JLMoSQvps2uamG3uW795x7fvece+659xEGpNGAcOAA5L/myQOP/C89UigUwq7rvgbg4T4DfG+a5gfRaHRNNW9HoeU4zjSAtEqZpv6UECKj0t0pyCyAd1TKNPW/KYSYU+nWBfIVgBsAfvQ8ryKNMAwjCOAYgMcBPKYyrKm/7yBrzJxh5vPxePwmEXE7Y5mZbNs+TEQvEpEM2bACqn8gRHTZdd2ziUTi912sNLLZ7H2maZ5j5ud85PoGYlUqlflUKvX3biAaY9Pp9J3BYHAGgLWDvH4QIjpbrVbTyWSytheIhszCwsJIIBBIMfO5Nnr0ghDRhWq1+moymfyrG4gmmLsDgcCHzHymRZ9WkN8Mw3g2Fov90guIho58Pv+g53kfAzjar6w1FwqF3o5EIm4vQYrFolkul98CIM+tRtPmkZLnec8kEokfegnR0JXNZh8yDOMTABP1b3pAiOgKM0eFELdUIJZlGePj44fkuNXV1VuWZXkqGcdxDhFRgZlPagVh5vfC4fCsKqwKhcKRra2tDBGdkAYx87WhoaHpaDT6hx+MDK+1tbU5InpDKwiAuBDC8TNGptORkZF5AMmWcQu1Wm1Gla4dxxEAbK0gRHR6amrqkh+I9Ibruh8BeKRl3LemaT6v8koulzvFzBf3HWRpaemw67qXmFkWiLcbEd0wTfPU5OTkTb+F6AsIAOX9oJ5GUwBkeDW3mVAolFbtr5b7j56sBSATCoVej0Qi//itqqyhRkdHp5hZVrggoszGxkZOVZMVi8U7yuXy+wC25QBoA/kSwBkhREmVSvfS7ziOPD8uAHhSN8g6M5+Ix+PX92KoSsa27SeI6BqAu3SDSP1OpVKZVoWJyujW/npJL+/nMv02mrbQkhOsAzgphPhit8b6jXcc5ykAV5q8oXWPbNtCRN+4rnt6p1uhZVlDExMTwVKptN5JaZLP5496nne+zZOTVo80YD4lIhGLxf5sXul6iMjU+wqAZXm4maZ5dWVlZbkdVD6fv4eZHWZ+uo3H9IPISdvVUIuLi/cODw9fZuZHWwz7FcBFwzA+a0C11mT7BlKfeFm+e9VqtauyjvI5EJvtlFDy2eg4gPt99k5/PNJsADN/bRhGplqtXh8bG3M3NzfnieilLhOCVhDpAcfzvJ8MwzgC4OX649ttm5n5OyKSj3MPABjvAkYbyM8AXhBCyNDYborN2gXDtqgeEGaeFUK82/qSaNv2cSLq6blSXwE9IDvdR3K53DFm/rzLMGrnPT0gA+MRAIOxR5rODd+s1e0Ob5LXE1o9NLBTVT0FGYxfbwPzM7TTGNjPcR39Q9xPAzud+wCk05Xq17gDj/RrpTud51+Swm1RKPvqDgAAAABJRU5ErkJggg=='
  };

  private readonly defaultIcon = this.icons.application;

  constructor(private readonly dialog: MatDialog, private readonly imageProvider: Base64ImageService) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.column && this.column) {
      const cdr = new class {
        public get hint(): string {
          return !this.column.GetValue()?.length ?
            '#LDS#If you do not select an icon, the default icon will be used.' : '';
        }
        constructor(public readonly column: IEntityColumn) {}
        public readonly isReadOnly = () => !this.column.GetMetadata().CanEdit();
      }(this.column);

      this.columnContainer.init(cdr);

      this.updateControlValue();
    }
  }

  public ngAfterViewInit(): void {
    this.controlCreated.emit(this.control);
  }

  public async openEditDialog(): Promise<void> {
    const imageSelectorDialogParams: MatDialogConfig = {
      autoFocus: false,
      data: {
        title: '#LDS#Edit Application Icon',
        icons: this.icons,
        imageUrl: this.control.value,
        defaultIcon: 'application'
      }
    };

    const result = await this.dialog.open(ImageSelectorDialogComponent, imageSelectorDialogParams).afterClosed().toPromise();

    if (result) {
      await this.column.PutValue(this.imageProvider.getImageData(result.file));
      this.updateControlValue();
      this.control.markAsDirty();
    }
  }

  private updateControlValue(): void {
    const value = this.column.GetValue();
    this.control.setValue(value?.length ? value : this.defaultIcon, { emitEvent: false });
  }
}
