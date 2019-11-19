import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';

@Injectable({providedIn: 'root'})
export class PostsService{

    error = new Subject<string>()

    constructor(private http: HttpClient){}

    createAndStorePost(title: string, content: string){
        const postData: Post = {title: title, content: content}
       this.http
       .post<{name: string}>(
        'https://ng-complete-guide-5b901.firebaseio.com/posts.json',
        postData,
        {
            observe: 'response'
        }
      )
      .subscribe(responseData => {
        console.log(responseData);
      },
      error => {
          this.error.next(error.message)
        }
      );
    }

    fetchPosts(){
        return this.http
      .get<{[key: string]: Post}>('https://ng-complete-guide-5b901.firebaseio.com/posts.json',
        {
            headers: new HttpHeaders({'custom-header':'Hello'}),
            params: new HttpParams().set('print', 'pretty'),
            responseType: 'json'
        }
      )
      .pipe(map( (responseData) => {
        const postArray: Post[] = []
        for(const key in responseData){
          postArray.push({...responseData[key], id: key});
        }
        return postArray;
      }),
      catchError(errorResponse => {
          return throwError(errorResponse);
      })
      )
    }

    deletePosts(){
        return this.http.delete('https://ng-complete-guide-5b901.firebaseio.com/posts.json',
        {
            observe: 'events'
        }
        ).pipe(tap(event => {
            if(event.type === HttpEventType.Response){
                console.log('------>Response body', event.body)
            }
        }));
    }

}