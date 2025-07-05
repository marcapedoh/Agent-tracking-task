import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

interface MenuItem {
  label: string;
  route: string;
  roles?: string[];
}

// Typage clair des rôles possibles
type UserRole = 'zone_manager' | 'admin' | 'analyst';


export const MENU_ITEMS: Record<UserRole, MenuItem[]> = {
  zone_manager: [
    { label: 'Dashboard', route: 'dashboard' },
    { label: 'Rapports', route: '/zone-manager/resellers' },
    { label: 'Daily Tracking', route: 'daily-tracking' },
    { label: 'Communication', route: '/zone-manager/communication' },
  ],
  admin: [
    { label: 'Dashboard', route: '/home/dashboard' },
    { label: 'User Management', route: '/admin/users' },
    { label: 'Zone Management', route: '/admin/zones' },
    { label: 'Rule Config', route: '/admin/rules' },
  ],
  analyst: [
    { label: 'Dashboard', route: '/home/dashboard' },
    { label: 'Zone Comparison', route: '/hq/comparison' },
    { label: 'KPI Trends', route: '/hq/kpi-trends' },
    { label: 'Export', route: '/hq/export' },
  ]
};

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  displayedMenus: MenuItem[] = [];
  userRole: UserRole | '' = '';  // initialisé vide
  userName: string = '';
  isMenuOpen: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    const role = this.authService.getUserRole().toLowerCase() as UserRole;
    this.userRole = role;
    this.userName = this.authService.getUserName();
    this.displayedMenus = MENU_ITEMS[role] || [];
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout();
  }
}
