// src/app/pages/analytics/analytics.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router'; // Import Router
import { addIcons } from 'ionicons'; // Import addIcons
import { homeOutline, personCircleOutline } from 'ionicons/icons'; // Import Icons
import { ApiService } from '../../core/services/api.service';
import { UserAuthService } from '../../core/services/user-auth.service';
import { PerformanceMetricDto } from '../../core/models/performance-metric.dto';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AnalyticsPage implements OnInit {
  metrics: PerformanceMetricDto[] = [];
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private authService: UserAuthService,
    private router: Router // Inject Router
  ) {
    // Register the icons
    addIcons({ homeOutline, personCircleOutline });
  }

  ngOnInit() {
    this.loadMetrics();
  }

  loadMetrics() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.isLoading = true;
    this.apiService
      .get<PerformanceMetricDto[]>(`PerformanceMetrics/user/${userId}`)
      .subscribe({
        next: (data) => {
          this.metrics = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  // Navigation Methods
  goToHome() {
    this.router.navigate(['/home']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
