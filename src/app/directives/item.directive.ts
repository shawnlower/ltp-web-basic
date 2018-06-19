import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appItemDirective]',
})

export class ItemDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}


