// client/src/app/core/http.service.ts
import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpContext, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';

interface HttpOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  context?: HttpContext;
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  reportProgress?: boolean;
  responseType?: 'json';
  observe?: 'body';
  withCredentials?: boolean;
  transferCache?: { includeHeaders?: string[] } | boolean;
}
@Injectable({ providedIn: 'root' })
export class HttpService {
  private http = inject(HttpClient);

  get<T>(url: string, options?: Parameters<HttpClient['get']>[1]): Observable<T> {
    return this.http.get<T>(url, { ...(options ?? {}), observe: 'body' });
  }

  post<T>(url: string, body: any, options?: Parameters<HttpClient['post']>[2]): Observable<T>{
    return this.http.post<T>(url, body, { ...(options ?? {}), observe: 'body' });
  }


  put<T>(url: string, body: any, options?: Parameters<HttpClient['put']>[2]): Observable<T> {
    return this.http.put<T>(url, body, { ...(options ?? {}), observe: 'body' });
  }

  delete<T>(url: string, options?: Parameters<HttpClient['delete']>[1]): Observable<T>{
    return this.http.delete<T>(url, { ...(options ?? {}), observe: 'body' });
  }
}
