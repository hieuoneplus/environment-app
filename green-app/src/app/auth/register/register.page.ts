import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import {IonicModule} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [IonicModule, FormsModule, CommonModule]
})
export class RegisterPage {
  private base = environment.apiBase;
  form: any = {};

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    this.http.post(`${this.base}/api/auth/register`, this.form)
      .subscribe(() => this.router.navigateByUrl('/login'));
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }
}

