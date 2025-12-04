# Utiliser l'image officielle Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Installer toutes les dépendances (y compris devDependencies pour le build)
RUN npm install

# Copier le reste de l'application
COPY . .

# Construire le CSS avec Tailwind + DaisyUI
RUN npm run build:css

# Exposer le port 3000
EXPOSE 3000

# Définir la variable d'environnement pour le port
ENV PORT=3000

# Démarrer l'application
CMD ["npm", "start"]

