import { Component, Input } from '@angular/core';

@Component({
  template: `
    <div id="content" about="" class="form-group" typeof="">
      <h3>{{ data.itemType }}</h3>
    </div>
  `
})

export class ItemHeaderComponent {

  @Input() data: any;

}

