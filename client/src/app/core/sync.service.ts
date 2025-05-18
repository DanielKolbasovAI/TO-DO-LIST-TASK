import {Injectable, NgZone} from '@angular/core';
import { Subject} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private socket: WebSocket | null = null;
  private taskChangesSubject = new Subject<any>(); // Replace `any` with your TaskChanges model if desired

  public taskChanges$ = this.taskChangesSubject.asObservable();

  constructor(private ngZone: NgZone) {}

  connect() {
    this.socket = new WebSocket('ws://localhost:8080');

    this.socket.onmessage = (event) => {
      this.ngZone.run(() => {
        try {
          const message = JSON.parse(event.data);
          this.taskChangesSubject.next(message);
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      });
    };

    this.socket.onclose = () => {
      console.warn('WebSocket closed. Reconnecting in 3s...');
      setTimeout(() => this.connect(), 3000);
    };

    this.socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      this.socket?.close();
    };
  }

  disconnect() {
    this.socket?.close();
  }
}
