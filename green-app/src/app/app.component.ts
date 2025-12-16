import { Component, OnInit, AfterViewInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, AfterViewInit {
  constructor(private router: Router) {
    const user = localStorage.getItem('user');

    if (user) {
      this.router.navigateByUrl('/app');
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  ngOnInit() {
    // Force enable interactions immediately
    if (typeof document !== 'undefined') {
      document.body.style.pointerEvents = 'auto';
      document.body.style.touchAction = 'manipulation';
    }
  }

  ngAfterViewInit() {
    // CRITICAL FIX: Remove any blocking elements after view init
    setTimeout(() => {
      this.fixInteractions();
    }, 100);

    // Also fix after a longer delay to catch late-loading elements
    setTimeout(() => {
      this.fixInteractions();
    }, 1000);
  }

  private fixInteractions() {
    if (typeof document === 'undefined') return;

    // 1. Remove all blocking overlays
    const overlays = document.querySelectorAll(
      'ion-loading, .loading-wrapper, .overlay-wrapper, .ion-overlay-wrapper'
    );
    overlays.forEach(overlay => {
      const el = overlay as HTMLElement;
      const ariaHidden = el.getAttribute('aria-hidden');
      if (ariaHidden === 'true' || el.style.display === 'none') {
        el.remove();
      } else {
        // Check if it's actually visible
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          el.remove();
        }
      }
    });

    // 2. Force enable pointer events on critical elements
    const criticalSelectors = [
      'body',
      'ion-app',
      'ion-router-outlet',
      'ion-tabs',
      'ion-content',
      '.ion-page'
    ];

    criticalSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.pointerEvents = 'auto';
        htmlEl.style.touchAction = 'manipulation';
      });
    });

    // 3. Fix all ion-content elements
    const contents = document.querySelectorAll('ion-content');
    contents.forEach(content => {
      const htmlEl = content as HTMLElement;
      htmlEl.style.pointerEvents = 'auto';
      htmlEl.style.touchAction = 'pan-y';
      
      // Also fix inner scroll
      const scrollContent = htmlEl.querySelector('.scroll-content, .inner-scroll');
      if (scrollContent) {
        (scrollContent as HTMLElement).style.pointerEvents = 'auto';
      }
    });

    // 4. Fix all interactive elements
    const interactiveSelectors = [
      'ion-button',
      'ion-checkbox',
      'ion-item',
      'ion-card',
      'ion-card[button]'
    ];

    interactiveSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.pointerEvents = 'auto';
        htmlEl.style.cursor = 'pointer';
      });
    });

    console.log('✅ Fixed interactions - all elements should be clickable now');
  }
}
