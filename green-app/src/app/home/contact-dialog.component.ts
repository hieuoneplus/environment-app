import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonButtons,
  IonButton as IonButtonDirective
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { close, logoFacebook, call, person, mail, chevronForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-contact-dialog',
  templateUrl: './contact-dialog.component.html',
  styleUrls: ['./contact-dialog.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonButtons,
    IonButtonDirective,
    CommonModule
  ],
  standalone: true
})
export class ContactDialogComponent {
  constructor(private modalController: ModalController) {
    addIcons({ close, logoFacebook, call, person, mail, chevronForwardOutline });
  }

  close() {
    this.modalController.dismiss();
  }

  openFacebook() {
    window.open('https://web.facebook.com/people/GREEN-WAVE/61584711159651/', '_blank');
  }

  callPhone() {
    window.location.href = 'tel:+085 746 8238';
  }

  sendEmail() {
    window.location.href = 'mailto:thanhyt004@gmail.com';
  }
}
