import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

interface MenuItem {
  label: string;
  route?: string;  // Rendons cette propriété optionnelle avec le ?
  roles?: string[];
  children?: MenuItem[];
}

// Typage clair des rôles possibles
type UserRole = 'zone_manager' | 'admin' | 'analyst';


export const MENU_ITEMS: Record<UserRole, MenuItem[]> = {
  zone_manager: [
    { label: 'Dashboard', route: 'dashboard' },
    {
      label: 'Daily Tracking',
      children: [
        { label: 'Global view', route: 'daily-tracking' },
        { label: 'Inactive details', route: 'daily-tracking/inactive-detail' },
      ]
    },
    { label: 'Campaigns', route: '/zone-manager/resellers' },
    { label: 'Reports', route: '/zone-manager/resellers' },
    { label: 'History', route: '/zone-manager/communication' },
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

  isUserDropdownOpen = false;

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  logout() {
    // Votre logique de déconnexion existante
    this.isUserDropdownOpen = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // logout() {
  //   this.authService.logout();
  // }
}
