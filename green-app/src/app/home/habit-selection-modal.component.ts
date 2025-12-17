import { Component, OnInit, Input } from '@angular/core';
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
  IonBadge,
  IonButtons,
  IonButton as IonButtonDirective
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { close, checkmarkCircle, add } from 'ionicons/icons';
import { HabitService } from '../core/services/habit.service';
import { HabitDTO } from '../core/services/home.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-habit-selection-modal',
  templateUrl: './habit-selection-modal.component.html',
  styleUrls: ['./habit-selection-modal.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonBadge,
    IonButtons,
    IonButtonDirective,
    CommonModule
  ],
  standalone: true
})
export class HabitSelectionModal implements OnInit {
  @Input() currentHabits: string[] = [];
  @Input() allHabits: HabitDTO[] = [];

  availableHabits: HabitDTO[] = [];
  isLoading = true;

  constructor(
    private modalController: ModalController,
    private habitService: HabitService
  ) {
    addIcons({ close, checkmarkCircle, add });
  }

  async ngOnInit() {
    try {
      const habits = await firstValueFrom(this.habitService.getAllHabits());
      // Filter out habits that are already subscribed (in currentHabits)
      this.availableHabits = habits.filter(h => !this.currentHabits.includes(h.id));
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading habits:', error);
      this.isLoading = false;
    }
  }

  close() {
    this.modalController.dismiss();
  }

  selectHabit(habit: HabitDTO) {
    this.modalController.dismiss({
      selected: true,
      habit: habit
    });
  }

  getIconName(iconName: string | undefined): string {
    if (!iconName) return 'leaf';
    const iconMap: { [key: string]: string } = {
      'water': 'water',
      'bag': 'bag',
      'trash': 'trash',
      'close-circle': 'close-circle',
      'bag-handle': 'bag-handle',
      'leaf': 'leaf',
      'bicycle': 'bicycle'
    };
    return iconMap[iconName] || 'leaf';
  }
}
