import { Component, EnvironmentInjector, inject } from '@angular/core';
import {IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {triangle, ellipse, square, gift, camera, person, home} from 'ionicons/icons';
import {RouterModule} from "@angular/router";

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({ home, camera, gift, person });
  }
}
