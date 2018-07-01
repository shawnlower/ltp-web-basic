import {
         AfterViewInit,
         Component,
         Input,
         OnInit,
       } from '@angular/core';


// Data passed to the header section
export class HeaderSectionData {
  label: string;
  headerSize = 4; // 1..5
}

@Component({
  selector: 'app-item-header',
  template: `
    <div id="content"
      class="form-group"
      typeof=""
      [ngSwitch]="data.headerSize"
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
      <h5 *ngSwitchDefault>
          <!--
          class="text-warning">
          -->
        {{ data.label }}
      </h5>
    </div>
  `
})

export class ItemHeaderComponent implements OnInit {

  @Input() data: HeaderSectionData;

  constructor() {
  }

  ngOnInit() {
    console.log('[ItemHeaderComponent]', this.data);
  }

}

