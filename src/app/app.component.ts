import { Component, HostListener, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  @ViewChildren('searchBox') vc;

  constructor() {
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    console.log(event);

    if(event.key === "/")
      this.vc.first.nativeElement.focus();
    else if(event.key === "?")
      alert("HELP");
  }
}
