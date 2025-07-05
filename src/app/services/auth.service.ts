import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getUserRole(): string {
    return 'ZONE_MANAGER'; // Tu peux tester avec 'ADMIN' ou 'DIRECTOR'
  }

  constructor() { }

  getUserName() {
    return "";
  }

  logout() {

  }
}
