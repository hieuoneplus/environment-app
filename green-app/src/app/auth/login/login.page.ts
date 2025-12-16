import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import {IonicModule} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonicModule, FormsModule, CommonModule]
})
export class LoginPage {
  private base = environment.apiBase;
  email = '';
  password = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    if (localStorage.getItem('user')) {
      this.router.navigateByUrl('/app');
    }
  }

  login() {
    this.http.post<any>(`${this.base}/api/auth/login`, {
      email: this.email,
      password: this.password
    }).subscribe(res => {
      localStorage.setItem('user', JSON.stringify(res));
      this.router.navigateByUrl('/app');
    }, error => {
        alert('Lỗi gọi API: ' + (error?.error?.message || error.statusText || 'Unknown'));
        console.error(error);
      }
    )

  }

  goRegister() {
    this.router.navigateByUrl('/register');
  }
}
