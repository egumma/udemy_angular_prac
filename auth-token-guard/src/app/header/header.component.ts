import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  constructor(private dataStorageService: DataStorageService,
     private authService: AuthService,
     private router: Router) {}
  
  isAuthenticated: boolean;
  userSubscription: Subscription;

  ngOnInit(){
    this.userSubscription = this.authService.user.subscribe( user =>{
      this.isAuthenticated = !!user
    });
  }

  ngOnDestroy(){
    this.userSubscription.unsubscribe();
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
  
  onSaveData() {
    this.dataStorageService.storeRecipes();
  }

  onFetchData() {
    this.dataStorageService.fetchRecipes().subscribe();
  }
}
