import { Component, Input } from '@angular/core';

@Component({
  template: `
  <div id="{{ data.elem_id }}" class="form-group"
  >
    <label for="content_key" class="col-sm-2 control-label">{{ data.label }}</label>
    <div class="col-sm-10">
      <input
        [attr.property]="data.key"
        id="content_key"
        class="form-control"
        value="{{ data.value }}
      ">
    </div>
  </div>
  `
})

export class ItemSectionComponent {

  @Input() data: any;

}
