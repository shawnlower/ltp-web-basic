import { Component, Input } from '@angular/core';

@Component({
  template: `
    <div>
      <h4>{{data.headline}}: {{ data.id }}</h4>
      <textarea width="100%">{{ data.json | json}}</textarea>
    </div>
  `
})

// export class ItemSectionComponent implements ItemSectionComponent {
export class ItemSectionComponent {

  @Input() data: any;

}
