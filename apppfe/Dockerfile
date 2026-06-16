# ==========================================
# Étape 1 : Build de l'application Angular
# ==========================================
FROM node:18-alpine AS build
WORKDIR /app

# Installation des dépendances (optimisation du cache Docker)
COPY package*.json ./
# On ajoute le drapeau pour contourner le conflit strict d'Angular v22 et ng2-charts
RUN npm ci --legacy-peer-deps

# Copie du code et build de production
COPY . .
RUN npm run build -- --configuration=production

# ==========================================
# Étape 2 : Serveur Web Nginx pour la Production
# ==========================================
FROM nginx:1.25-alpine

# Suppression de la configuration Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Injection d'une configuration personnalisée pour SPA (Single Page Application)
# Cette configuration gère le routeur d'Angular pour éviter les crashs sur F5
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
        root /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copie des artefacts de build Angular vers le dossier public de Nginx
# ⚠️ ATTENTION : Vérifie le chemin de sortie exact dans ton fichier angular.json (ex: dist/g2ii ou dist/)
COPY --from=build /app/dist/apppfe/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]