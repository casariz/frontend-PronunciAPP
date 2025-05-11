import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule],
})
export class SidebarComponent implements OnInit {
  currentPage: string = 'Dashboard';
  sidebarCollapsed: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Set initial page based on current route
    this.setCurrentPageFromUrl(this.router.url);
    
    // Update current page on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.setCurrentPageFromUrl(event.url);
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private setCurrentPageFromUrl(url: string): void {
    // Extract the current page from the URL
    const urlPath = url.split('/').pop() || 'dashboard';
    
    // Set the current page title based on the URL
    switch(urlPath) {
      case 'dashboard':
        this.currentPage = 'Dashboard';
        break;
      case 'historial':
        this.currentPage = 'Historial';
        break;
      case 'settings':
        this.currentPage = 'Configuración';
        break;
      default:
        this.currentPage = 'Dashboard';
    }
  }
}
