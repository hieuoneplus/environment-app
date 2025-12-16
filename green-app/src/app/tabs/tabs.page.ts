import { Component, EnvironmentInjector, inject, AfterViewInit } from '@angular/core';
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
export class TabsPage implements AfterViewInit {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({ home, camera, gift, person });
  }

  ngAfterViewInit() {
    // Ensure router outlet is interactive
    setTimeout(() => {
      const routerOutlet = document.querySelector('ion-tabs ion-router-outlet');
      if (routerOutlet) {
        (routerOutlet as HTMLElement).style.pointerEvents = 'auto';
        (routerOutlet as HTMLElement).style.touchAction = 'pan-y';
      }
    }, 200);
  }
}
