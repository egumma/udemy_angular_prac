import { HttpInterceptor, HttpRequest, HttpHandler, HttpEventType } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export class LoggingInterceptorService implements HttpInterceptor{
    intercept(req: HttpRequest<any>, next: HttpHandler){
        console.log('\n------->LoggingInterceptor: Request ', req.url)
        const modifyRequest = req.clone({headers: req.headers.append('Auth','xyz')})
        return next.handle(modifyRequest).pipe(
            tap(event => {
                if(event.type === HttpEventType.Response){
                    console.log('------->LoggingInterceptor: Response ')
                }
            })
        );
    }
}