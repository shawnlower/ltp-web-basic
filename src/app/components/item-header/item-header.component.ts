import { Component, Input } from '@angular/core';

@Component({
  template: `
    <div id="content"
      class="form-group"
      typeof=""
      [ngSwitch]="data.headingSize"
    >
      <h1 *ngSwitchCase="1">
        {{ data.label }}
      </h1>
      <h2 *ngSwitchCase="2">
        {{ data.label }}
      </h2>
      <h3 *ngSwitchCase="3">
        {{ data.label }}
      </h3>
      <h4 *ngSwitchCase="4">
        {{ data.label }}
      </h4>
      <h5 *ngSwitchDefault
          class="text-warning">
        {{ data.label }}
      </h5>
    </div>
  `
})

export class ItemHeaderComponent {

  @Input() data: any;

}

