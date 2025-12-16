import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private router: Router) {
    const user = localStorage.getItem('user');

    if (user) {
      this.router.navigateByUrl('/app');
    } else {
      this.router.navigateByUrl('/login');
    }
  }
}
