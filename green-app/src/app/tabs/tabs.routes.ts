import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'camera',
        loadComponent: () =>
          import('../camera/camera.page').then((m) => m.CameraPage),
      },
      {
        path: 'reward',
        loadComponent: () =>
          import('../reward/reward.page').then((m) => m.RewardPage),
      },
      {
        path: 'me',
        loadComponent: () =>
          import('../me/me.page').then((m) => m.MePage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  }
];
