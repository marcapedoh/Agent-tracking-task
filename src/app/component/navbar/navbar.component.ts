import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

interface MenuItem {
  label: string;
  route?: string;
  roles?: string[];
  children?: MenuItem[];
}

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
  userRole: UserRole | '' = '';
  userName: string = '';
  isMenuOpen: boolean = false;
  isUserDropdownOpen = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    const role = this.authService.getUserRole().toLowerCase() as UserRole;
    this.userRole = role;
    this.userName = this.authService.getUserName();
    this.displayedMenus = MENU_ITEMS[role] || [];
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  logout() {
    this.authService.logout();
    this.isUserDropdownOpen = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /** Permet de savoir si un sous-menu est actif pour garder le parent (Daily Tracking) actif */
  isActiveSubMenu(menu: MenuItem): boolean {
    if (!menu.children) {
      return false;
    }
    return menu.children.some(child => this.router.url.includes(child.route || ''));
  }
}
