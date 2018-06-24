import { Component, Input } from '@angular/core';

@Component({
  template: `
  <div id="{{ data.elem_id }}" class="form-group"
  >
    <label for="content_key" class="col-sm-2 control-label">{{data.key}}</label>
    <div class="col-sm-10">
      <input id="content_key" class="form-control" property="" value="{{ data.value | json }}">
    </div>
  </div>
  `
})

export class ItemSectionComponent {

  @Input() data: any;

}
