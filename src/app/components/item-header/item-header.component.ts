import { Component, Input } from '@angular/core';

@Component({
  template: `
    <div id="content" about="" class="form-group" typeof=""
         [ngSwitch]="data.headingSize"
    >
      <h1 *ngSwitchCase="1">
        {{ data.itemType }}
      </h1>
      <h2 *ngSwitchCase="2">
        {{ data.itemType }}
      </h2>
      <h3 *ngSwitchCase="3">
        {{ data.itemType }}
      </h3>
      <h4 *ngSwitchCase="4">
        {{ data.itemType }}
      </h4>
      <h5 *ngSwitchDefault
          class="text-warning">
        {{ data.itemType }}
      </h5>
    </div>
  `
})

export class ItemHeaderComponent {

  @Input() data: any;

}

