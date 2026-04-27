import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Categorie } from '../Model/Entity';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {

private categorieUrl = 'http://localhost:8070/api/categories';


 private categoriesSubject = new BehaviorSubject<Categorie[]>([]);
  public categories$ = this.categoriesSubject.asObservable();


constructor(private http: HttpClient) { }

   // ==================== CATÉGORIES ====================

  /**
   * 🔧 Initialiser les catégories par défaut
   * POST /api/categories/init
   */
  initialiserCategories(): Observable<any> {
    console.log('🔧 Initialisation des catégories');
    return this.http.post(`${this.categorieUrl}/init`, {});
  }

  /**
   * 📋 Lister toutes les catégories
   * GET /api/categories/all
   */
  getCategories(): Observable<any> {
    console.log('📋 Récupération des catégories');
    return this.http.get<any>(`${this.categorieUrl}/all`).pipe(
      // Mettre à jour le subject quand les catégories sont reçues
      (response) => {
        response.subscribe((res: any) => {
          const categories = res.categories || [];
          this.categoriesSubject.next(categories);
        });
        return response;
      }
    );
  }

  /**
   * 📋 Récupérer les types de tickets disponibles
   * GET /api/categories/types/all
   */
  getTypesDisponibles(): Observable<any> {
    console.log('📋 Récupération des types disponibles');
    return this.http.get<any>(`${this.categorieUrl}/types/all`);
  }

  /**
   * 🔍 Récupérer une catégorie par ID
   * GET /api/categories/{id}
   */
  getCategorieById(id: number): Observable<Categorie> {
    console.log('🔍 Récupération catégorie ID:', id);
    return this.http.get<Categorie>(`${this.categorieUrl}/${id}`);
  }

  /**
   * 🔍 Rechercher une catégorie par type
   * GET /api/categories/type/{type}
   */
  getCategorieParType(type: string): Observable<Categorie> {
    console.log('🔍 Recherche catégorie type:', type);
    return this.http.get<Categorie>(`${this.categorieUrl}/type/${type}`);
  }

  /**
   * ➕ Ajouter une nouvelle catégorie
   * POST /api/categories/ajouter
   */
  creerCategorie(categorie: any): Observable<any> {
    console.log('➕ Création catégorie:', categorie.nomCategorie);
    return this.http.post(`${this.categorieUrl}/ajouter`, categorie);
  }

  /**
   * ✏️ Modifier une catégorie
   * PUT /api/categories/{id}
   */
  modifierCategorie(id: number, categorie: any): Observable<any> {
    console.log('✏️ Modification catégorie ID:', id);
    return this.http.put(`${this.categorieUrl}/${id}`, categorie);
  }

  /**
   * 📦 Archiver une catégorie
   * DELETE /api/categories/{id}
   */
  archiverCategorie(id: number): Observable<any> {
    console.log('📦 Archivage catégorie ID:', id);
    return this.http.delete(`${this.categorieUrl}/${id}`);
  }

  /**
   * 📊 Obtenir les statistiques des catégories
   * GET /api/categories/stats
   */
  getCategoriesStatistiques(): Observable<any> {
    console.log('📊 Récupération statistiques catégories');
    return this.http.get<any>(`${this.categorieUrl}/stats`);
  }

}
