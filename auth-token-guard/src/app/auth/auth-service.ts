import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';

export interface ResponseData{
    idToken:  string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: boolean
}

@Injectable({providedIn: 'root'})
export class AuthService{

    user = new BehaviorSubject<User>(null);
    tokenExpirationTime = null;

    constructor(private http: HttpClient, private router: Router){}

    signUp(email: string, password: string){
        return this.http.post<ResponseData>("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAEuH2yMA-XrR5H8ZBVp4k8yZHh-Z5vpBQ",
        {
            email: email,
            password: password,
            returnSecureToken: true
        })
        .pipe(catchError(this.handleError), 
        tap(resData => this.handleAuthentication(resData.email, 
            resData.localId, 
            resData.idToken, 
            +resData.expiresIn)
        ));
    }

    login(email: string, password: string){
        return this.http.post<ResponseData>("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAEuH2yMA-XrR5H8ZBVp4k8yZHh-Z5vpBQ",
        {
            email: email,
            password: password,
            returnSecureToken: true
        })
        .pipe(catchError(this.handleError), 
            tap(resData => this.handleAuthentication(resData.email, 
                resData.localId, 
                resData.idToken, 
                +resData.expiresIn)
            ));
    }

    logout(){
        this.user.next(null);
        this.router.navigate(['/auth']);
        localStorage.removeItem('userData');
        if(this.tokenExpirationTime){
            clearTimeout(this.tokenExpirationTime);
        }
        this.tokenExpirationTime = null;
    }

    autoLogin(){
        const userData: {
            email: string;
            id: string;
            _token: string;
            _tokenExpirationDate: Date;
        } = JSON.parse(localStorage.getItem('userData'));

        if(!userData){
            console.log('-----> user NOT FOUND to autologin');
            this.router.navigate(['/auth']);
            return;
        }
        const loadedUser = new User(userData.email,
             userData.id, 
             userData._token, 
             new Date(userData._tokenExpirationDate))
        if(loadedUser.token){
            console.log('-----> user FOUND so autologin');
            this.user.next(loadedUser);
            const expireDuration = new Date(userData._tokenExpirationDate).getTime() - 
                                   new Date().getTime();
            this.autoLogout(expireDuration); 
        }
    }

    autoLogout(tokenExpirationTime: number){

        this.tokenExpirationTime = setTimeout(() => {
            this.logout();
        }, tokenExpirationTime);
    }

    private handleAuthentication(
        email: string, 
        localId: string, 
        idToken: string, 
        expiresIn: number){
            const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
            const user = new User(email, localId, idToken, expirationDate);
            this.user.next(user);
            this.autoLogout(expiresIn * 1000);
            localStorage.setItem('userData', JSON.stringify(user));
    }

    private handleError(errorResp: HttpErrorResponse){
        let errorMessage = "An unknown error message";
        if(!errorResp.error || !errorResp.error.error){
            return throwError(errorMessage);
        }
        switch(errorResp.error.error.message){
            case 'EMAIL_EXISTS':
                    errorMessage = "The email address is already in use by another account.";
                    break;
            case 'OPERATION_NOT_ALLOWED':
                    errorMessage = "Password sign-in is disabled for this project.";
                    break;
            case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                    errorMessage = " We have blocked all requests from this device due to unusual activity. Try again later.";
                    break;
            case 'EMAIL_NOT_FOUND':
                    errorMessage = "There is no user record corresponding to this identifier. The user may have been deleted.";
                    break;
            case 'INVALID_PASSWORD':
                    errorMessage = "The password is invalid or the user does not have a password.Password sign-in is disabled for this project.";
                    break;
            case 'USER_DISABLED':
                    errorMessage = "The user account has been disabled by an administrator.";
        }            
        return throwError(errorMessage);
    }
}