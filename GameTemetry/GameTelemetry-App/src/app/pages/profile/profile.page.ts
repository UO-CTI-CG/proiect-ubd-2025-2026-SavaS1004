import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  mailOutline,
  calendarOutline,
  logOutOutline,
  homeOutline,
} from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { UserAuthService } from '../../core/services/user-auth.service';
import { UserResponse } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ProfilePage implements OnInit {
  user: UserResponse | null = null;
  isLoading = true;

  constructor(
    private api: ApiService,
    private authService: UserAuthService,
    private router: Router,
    private navCtrl: NavController
  ) {
    addIcons({
      personCircleOutline,
      mailOutline,
      calendarOutline,
      logOutOutline,
      homeOutline,
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    // Fetches data from UserController: [HttpGet("{id}")]
    this.api.get<UserResponse>(`User/${userId}`).subscribe({
      next: (data) => {
        this.user = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.isLoading = false;
      },
    });
  }

  logout() {
    this.authService.logout();
    this.navCtrl.navigateRoot('/login');
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}
