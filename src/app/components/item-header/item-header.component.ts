import { Component, Input } from '@angular/core';

@Component({
  template: `
    <div class="job-ad">

      <h4>{{data.headline}}</h4>

      {{data.body}}
    </div>
  `
})

export class ItemHeaderComponent {

  @Input() data: any;

}

