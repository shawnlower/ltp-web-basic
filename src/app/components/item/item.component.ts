import {
  Component, Input, Type
} from '@angular/core';

@Component({
  template: `
  `
})
export class ItemComponent {
  constructor(public component: Type<any>, public data: any) {}
}
