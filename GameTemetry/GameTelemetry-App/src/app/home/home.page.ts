import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel]
})
export class HomePage implements OnInit {
  users: any[] = [];
  error: string = '';

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.apiService.get<any[]>('User').subscribe({
      next: (data) => {
        this.users = data;
        console.log('Users loaded:', data);
      },
      error: (err) => {
        this.error = 'Failed to load users';
        console.error('API Error:', err);
      }
    });
  }
}
