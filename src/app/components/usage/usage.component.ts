
import {
         AfterViewInit,
         Component,
         Input,
         OnInit,
         OnDestroy,
       } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';

import { Store } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import * as appActions from '../../actions/app.actions';

import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';
import { Unlisten } from '../../services/keyboard-shortcuts.service';

@Component({
  selector: 'app-usage',
  styleUrls: ['./usage.component.css'],
  animations: [
    trigger('modal-editor', [
      transition('void => *', [
        style({ transform: 'scale3d(.3, .3, .3)' }),
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(.0, .0, .0)' }))
      ])
    ])
  ],
  template: `
<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="usage" aria-hidden="true"
     [ngStyle]="{'display': visible ? 'block' : 'none', 'opacity': 1 }">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Usage</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <h5>Keys: This application supports a wide range of vim key-bindings, including j and k (exclusive).</h5>
        <p> j / k : Select next / previous card
        <p> e     : [E]dit existing item
        <p> n     : Create [N]ew item
        <p> d     : [D]elete item.
        <p> ?     : Usage[?]
      </div>
    </div>
  </div>
</div>
  `
})
export class UsageComponent implements OnInit, OnDestroy {

  @Input() visible: boolean;
  public unlisten: Unlisten;

  constructor(
    public keyboardShortcuts: KeyboardShortcutsService,
    public store: Store<fromRoot.State>
  ) {
    this.keyboardShortcuts = keyboardShortcuts;
  }

  ngOnInit() {
    this.unlisten = this.keyHandler();
  }

  keyHandler(): Unlisten {
    // Handle shortcuts within an input dialog

    return this.keyboardShortcuts.listen({
      'Escape': ( event: KeyboardEvent ): void => {

        this.store.dispatch(new appActions.ToggleUsage());
        event.preventDefault();

      }
    }, {
      // Priority should be lower than our modal
      priority: 0,
      inputs: true
    });
  }

  ngOnDestroy() {
  }


}

