import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class HttpsRequestInterceptor implements HttpInterceptor {
    token: string;
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.token = localStorage.getItem('token');
        // TODO 加入对不同的url进行不同的逻辑操作
        // return next.handle(req);

        if (this.token) {
            const dupReq = req.clone({ headers: req.headers.set('Authorization', this.token) });
            return next.handle(dupReq).pipe(
                map(event => {
                    console.log('event from ' + event);
                    if (event instanceof HttpResponse) {
                        const accessToken = event.headers.get('access_token');
                        if (accessToken) {
                            console.log('set local token ->' + accessToken);
                            localStorage.setItem('token', accessToken);
                        }
                    }
                    return event;
                }));
        } else {
            return next.handle(req);
        }
    }
}
