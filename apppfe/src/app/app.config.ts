import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient,withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';
import { HttpConfigInterceptor } from './interceptors/http-config.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
     provideClientHydration(), 
     provideHttpClient(),
     provideHttpClient(withFetch()),
     importProvidersFrom(NgChartsModule),
     {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true
    },
    
    ]
};
