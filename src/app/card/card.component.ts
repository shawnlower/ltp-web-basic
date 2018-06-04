import { Component, OnInit, Input } from '@angular/core';

import { Item } from '../models/item.model';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() item: Item;
  @Input() selected: boolean;

  constructor() { }

  ngOnInit() {
  }

}
