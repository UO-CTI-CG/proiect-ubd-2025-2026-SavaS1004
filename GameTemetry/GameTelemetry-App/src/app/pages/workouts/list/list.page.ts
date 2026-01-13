import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router'; // <--- Import Router
import { addIcons } from 'ionicons'; // <--- Import Icon registration
import { homeOutline, personCircleOutline } from 'ionicons/icons'; // <--- Import specific icons
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class ListPage implements OnInit {
  constructor(private router: Router) {
    addIcons({ homeOutline, personCircleOutline });
  }

  ngOnInit() {}

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
