import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {catchError} from 'rxjs/operators';

@Injectable()
export class ApiService {

  constructor(private http: HttpClient) {
  }

  private formatErrors(error: any): any {
    return  throwError(error.error);
  }

  get(path: string, params = new HttpParams() , ): Observable<any> {
    return this.http.get(`${environment.apiDomain}${path}`, { params  }).pipe(catchError(this.formatErrors));
  }

  put(path: string, body: any = {}): Observable<any> {
    return this.http.put(
      `${environment.apiDomain}${path}`,
      JSON.stringify(body), {headers : new HttpHeaders({ 'Content-Type': 'application/json' })}
    ).pipe(catchError(this.formatErrors));
  }

  post(path: string, body: any = {}): Observable<any> {
    return this.http.post(
      `${environment.apiDomain}${path}`,
      JSON.stringify(body), {headers : new HttpHeaders({ 'Content-Type': 'application/json' })}
    ).pipe(catchError(this.formatErrors));
  }

  delete(path): Observable<any> {
    return this.http.delete(
      `${environment.apiDomain}${path}`
    ).pipe(catchError(this.formatErrors));
  }
}
