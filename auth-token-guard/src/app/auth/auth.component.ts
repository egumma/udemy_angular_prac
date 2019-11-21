import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService, ResponseData } from './auth-service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent {
  isLoginMode = true;
  isLoading = false;
  error = null;

  constructor(private authService: AuthService, private router: Router){}

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    
    if(!form.valid){
      return;
    }

    let authObservable: Observable<ResponseData>

    this.isLoading = true;    
    const email = form.value.email;
    const password = form.value.password;
    if(this.isLoginMode){
      authObservable = this.authService.login(email, password);
    }else {      
      authObservable = this.authService.signUp(email, password);
    }
    authObservable.subscribe(
        respData => {
          this.isLoading = false;
          this.router.navigate(['/recipes']);
          console.log(respData);
        },
        errorResp => {
          this.isLoading = false;          
          this.error = errorResp;
          console.log(errorResp);
        }
      );

    form.reset();
  }


}
