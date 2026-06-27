# Rapport d'Architecture Logicielle & Technique

## Projet : Plateforme de Réservation Unifiée - FlightHotel

---

> [!NOTE]  
> Ce document fournit une analyse approfondie et détaillée de l'architecture logicielle, de la modélisation des données, des flux transactionnels, du modèle de sécurité et des choix technologiques de la plateforme **FlightHotel**. Il sert de référence pour la soutenance technique et l'audit du code du PFE.

---

## Table des Matières
1. [Principes Directeurs d'Architecture](#1-principes-directeurs-darchitecture)
2. [Architecture Frontend (Next.js & Zustand)](#2-architecture-frontend-nextjs--zustand)
3. [Architecture Backend (Express & MVC)](#3-architecture-backend-express--mvc)
4. [Modélisation & Architecture de la Base de Données](#4-modélisation--architecture-de-la-base-de-données)
5. [Architecture de Sécurité & RBAC](#5-architecture-de-sécurité--rbac)
6. [Flux Globaux & Diagrammes de Séquence](#6-flux-globaux--diagrammes-de-séquence)
7. [Architecture Réseau & Déploiement](#7-architecture-réseau--déploiement)

---

## 1. Principes Directeurs d'Architecture

La conception de la plateforme **FlightHotel** repose sur quatre piliers d'architecture logicielle :

```mermaid
graph TD
    A[Principes FlightHotel] --> B[Découplage Client-Serveur]
    A --> C[Modélisation Strictement Typée]
    A --> D[Authentification Stateless JWT]
    A --> E[Architecture Composant Réutilisable]
```

*   **Découplage strict (Client-Serveur / API-First)** : Le frontend (Next.js) et le backend (Express.js) fonctionnent comme deux applications indépendantes. Ils communiquent exclusivement via des requêtes HTTP asynchrones en échangeant des payloads au format JSON. Cela permet d'envisager un remplacement du client web par une application mobile sans altérer la logique métier backend.
*   **Modélisation strictement typée (TypeScript-First)** : L'ensemble de la base de code (du schéma de base de données aux composants UI) est régie par des types TypeScript ou des définitions Prisma. Les erreurs de structures de données sont ainsi détectées dès la compilation.
*   **Authentification sans état (Stateless)** : Le serveur ne stocke aucune session en mémoire vive. L'identité des requêtes est validée par décryptage de jetons cryptographiques signés (**JSON Web Tokens**).
*   **Performance & Caching** : Réduction du trafic réseau grâce à une synchronisation locale des données (TanStack Query) et à l'exploitation de la mémoire locale du navigateur.

---

## 2. Architecture Frontend (Next.js & Zustand)

Le frontend est construit sous la forme d'une application monopage (SPA) optimisée, propulsée par **Next.js 14+** et structurée avec l'**App Router**.

### Structure des Dossiers Frontend
```text
frontend/
├── app/                  # Système de routage Next.js (Pages & Dispositions)
│   ├── admin/            # Espace d'administration restreint
│   ├── auth/             # Pages d'authentification (login, register, forgot-pass)
│   ├── flights/          # Pages de recherche et réservation de vols
│   ├── hotels/           # Pages de recherche et réservation d'hôtels
│   ├── payment/          # Tunnel de paiement
│   └── profile/          # Profil utilisateur & Historique
├── components/           # Composants UI atomiques et globaux (layout, UI, cards)
├── context/              # Contextes React globaux (ex: LanguageContext pour i18n)
├── lib/                  # Fichiers de configuration client (API Axios, PDFKit)
├── locales/              # Dictionnaires de traduction (FR, EN, AR)
└── stores/               # Stores Zustand (Gestion de l'état global client)
```

### Gestion des États Côté Client
Le client divise sa gestion d'état en deux flux distincts pour optimiser la mémoire et éviter les rendus CPU inutiles :

```mermaid
graph LR
    subgraph Zustand [État Global Local (UI/Session)]
        AuthStore[Session Utilisateur & Tokens]
        UIStore[Menu Mobile & Thèmes]
      style AuthStore fill:#3b82f6,stroke:#1d4ed8,color:#fff
    end

    subgraph ReactQuery [État du Serveur (Données API)]
        Cache[Gestion du cache local]
        Refetch[Rafraîchissement en arrière-plan]
      style Cache fill:#10b981,stroke:#047857,color:#fff
    end
```

1.  **État local persistant (Zustand)** :
    *   Géré par le `authStore.ts`. Il stocke les données de l'utilisateur connecté et son Token JWT.
    *   Il utilise un middleware de persistance (`localStorage`) pour maintenir la session active même après le rafraîchissement de la page par l'utilisateur.
2.  **État du serveur synchronisé (TanStack React Query v5)** :
    *   Toutes les requêtes de données vers l'API (listes d'hôtels, recherches de vols, détails de réservations) passent par React Query.
    *   Les requêtes sont associées à des clés de cache uniques (ex: `['admin-flights', search]`). Les requêtes identiques récupèrent instantanément les données en cache pendant que React Query vérifie en arrière-plan si le serveur a de nouvelles données (*Stale-While-Revalidate*).

### i18n & Support RTL
L'internationalisation utilise un composant enveloppe `LanguageProvider` qui injecte le contexte de langue. Lors de la sélection de la langue Arabe (`ar`), le layout subit une modification instantanée :
```typescript
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'ar';
```
Grâce à Tailwind CSS, les éléments dotés du préfixe `rtl:` (comme `rtl:space-x-reverse`, `rtl:flex-row-reverse`, `rtl:text-right`) s'inversent de manière dynamique, garantissant une ergonomie parfaite pour la lecture de droite à gauche.

---

## 3. Architecture Backend (Express & MVC)

Le serveur API repose sur une architecture en couches (**MVC modifiée**) pour assurer une séparation stricte des responsabilités.

### Pipeline d'Exécution d'une Requête HTTP
Chaque requête entrante suit un cycle de validation rigoureux avant d'atteindre le contrôleur de base de données :

```mermaid
sequenceDiagram
    participant Client
    participant Express as Serveur Express (Entry)
    participant RateLimit as Middleware Rate Limiting
    participant Validate as Middleware Validation (Zod/Express Validator)
    participant Auth as Middleware Auth & RBAC
    participant Controller as Contrôleur (Logic Métier)
    participant ORM as Prisma Client (ORM)
    participant DB as Base de Données MySQL

    Client->>Express: Requête HTTP (ex: POST /api/flights)
    Express->>RateLimit: Analyse du débit
    alt Limite dépassée
        RateLimit-->>Client: HTTP 429 (Too many requests)
    else Débit autorisé
        RateLimit->>Validate: Assainissement & Structure
        alt Payload invalide
            Validate-->>Client: HTTP 400 (Champs manquants/invalides)
        else Payload correct
            Validate->>Auth: Vérification JWT & Rôles
            alt Non authentifié / Rôle insuffisant
                Auth-->>Client: HTTP 401 / 403 (Unauthorized/Forbidden)
            else Accès autorisé
                Auth->>Controller: Transmission de la requête
                Controller->>ORM: Requête ORM typée
                ORM->>DB: Exécution de la requête SQL
                DB-->>ORM: Retour des enregistrements
                ORM-->>Controller: Hydratation des objets JavaScript
                Controller-->>Client: HTTP 200/201 + JSON Payload
            end
        end
    end
```

### Rôle des Couches Backend :
1.  **Routeurs (`routes/`)** : Définissent les points d'entrée (Endpoints) de l'API. Ils associent les URLs HTTP aux contrôleurs correspondants et injectent les middlewares requis pour chaque route.
2.  **Middlewares (`middlewares/`)** :
    *   `auth.middleware.ts` : Intercepte les en-têtes HTTP `Authorization: Bearer <token>`, décode le token JWT et injecte l'utilisateur dans l'objet de requête Express (`req.user`).
    *   `role.middleware` (intégré via `authorize()`) : Compare le rôle de l'utilisateur connecté avec les rôles autorisés pour la route (ex: `authorize('ADMIN')`).
3.  **Contrôleurs (`controllers/`)** : Couche d'orchestration. Ils reçoivent les données validées, traitent la logique métier (calculs de prix, vérification de la disponibilité des chambres) et appellent l'ORM.
4.  **Accès aux Données (`lib/prisma.ts` & `prisma/`)** : Fournit une instance unique et globale du client Prisma (Design Pattern Singleton) pour économiser le pool de connexions à la base de données MySQL.

---

## 4. Modélisation & Architecture de la Base de Données

La modélisation de la base de données s'appuie sur une base relationnelle MySQL robuste structurée autour des relations suivantes :

```mermaid
erDiagram
    USERS {
        string id PK
        string email UK
        string passwordHash
        string firstName
        string lastName
        string role
        boolean isBlocked
        datetime createdAt
    }
    HOTELS {
        string id PK
        string name
        string city
        string address
        int stars
        string description
        string imageUrl
        string amenities
        string managerId FK
    }
    ROOMS {
        string id PK
        string hotelId FK
        string roomNumber
        string type
        decimal pricePerNight
        int capacity
        boolean isAvailable
    }
    AIRLINE_COMPANIES {
        string id PK
        string name
        string country
        string iataCode UK
        string logoUrl
    }
    FLIGHTS {
        string id PK
        string flightNumber
        string origin
        string destination
        datetime departureTime
        datetime arrivalTime
        decimal price
        int totalSeats
        int availableSeats
        string airlineId FK
        string status
    }
    FLIGHT_RESERVATIONS {
        string id PK
        string userId FK
        string flightId FK
        int seatsBooked
        string seatClass
        string passengerInfo
        decimal totalPrice
    }
    HOTEL_RESERVATIONS {
        string id PK
        string userId FK
        string hotelId FK
        string roomId FK
        datetime checkIn
        datetime checkOut
        int guestsCount
        decimal totalPrice
    }
    PAYMENTS {
        string id PK
        string flightReservationId FK
        string hotelReservationId FK
        decimal amount
        string status
        string provider
        string transactionId UK
    }

    USERS ||--o{ HOTELS : "gère (HOTEL_MANAGER)"
    USERS ||--o{ FLIGHT_RESERVATIONS : "effectue"
    USERS ||--o{ HOTEL_RESERVATIONS : "effectue"
    HOTELS ||--o{ ROOMS : "contient"
    HOTELS ||--o{ HOTEL_RESERVATIONS : "reçoit"
    ROOMS ||--o{ HOTEL_RESERVATIONS : "est_réservée_dans"
    AIRLINE_COMPANIES ||--o{ FLIGHTS : "opère"
    FLIGHTS ||--o{ FLIGHT_RESERVATIONS : "possède"
    FLIGHT_RESERVATIONS ||--o| PAYMENTS : "est_réglée_par"
    HOTEL_RESERVATIONS ||--o| PAYMENTS : "est_réglée_par"
```

### Choix Techniques de Modélisation
*   **Clés primaires UUIDv4** : L'utilisation de chaînes UUID aléatoires empêche les utilisateurs de deviner l'identifiant des réservations ou d'autres profils via des attaques d'énumération séquentielle.
*   **Cascade référentielle (`onDelete: Cascade`)** : Si un vol ou un hôtel est supprimé par un administrateur, Prisma propage automatiquement la suppression aux réservations associées pour éviter les données orphelines et les clés étrangères invalides en base de données.
*   **Champs JSON stringifiés** : Pour des structures complexes et évolutives (ex: `passengerInfo` dans la réservation de vol pour stocker le nom, prénom et passeport de chaque passager, ou `amenities` dans l'hôtel), les données sont stockées sous forme de chaîne JSON dans un champ texte de type `Text`, optimisant le nombre de tables jointes requises.

---

## 5. Architecture de Sécurité & RBAC

La protection des ressources repose sur un modèle d'accès hybride combinant la validation cryptographique et le cloisonnement basé sur l'identité :

```mermaid
graph TD
    A[Sécurité de l'API] --> B[Authentication Stateless JWT]
    A --> C[RBAC Middleware]
    A --> D[Isolation des données locataire]
    A --> E[Sécurisation des mots de passe]
    A --> F[Rate Limiter express]
```

1.  **Authentification par Token JWT** :
    *   Lors de la connexion, le serveur génère un jeton signé contenant l'ID utilisateur, son rôle et sa date d'expiration.
    *   Ce jeton est envoyé dans chaque en-tête de requête HTTP : `Authorization: Bearer <token>`.
2.  **Middleware de rôles (RBAC)** :
    *   Exemple de restriction sur la route de création d'hôtel :
      `router.post('/', authenticate, authorize('HOTEL_MANAGER', 'ADMIN'), createHotel);`
    *   Si le rôle spécifié dans le jeton JWT décodé n'est ni `ADMIN` ni `HOTEL_MANAGER`, Express intercepte la requête et renvoie instantanément un code HTTP `403 Forbidden`.
3.  **Isolation des données** :
    *   Pour éviter qu'un manager d'hôtel puisse voir ou modifier les réservations d'un autre hôtel, les contrôleurs backend filtrent systématiquement les requêtes de base de données en incluant le `managerId` extrait du jeton JWT de la requête.
4.  **Hachage des mots de passe** :
    *   Les mots de passe ne sont jamais stockés en clair. Ils sont chiffrés à l'aide de l'algorithme **bcrypt** avec un facteur de coût (Salt Rounds) de 10 avant leur persistance en base de données.
5.  **Limitation de débit (Rate Limiting)** :
    *   Un middleware limite le nombre maximal d'appels API à 200 requêtes toutes les 15 minutes par adresse IP pour contrer les attaques par déni de service (DDoS) et l'usurpation de force brute sur l'authentification.

---

## 6. Flux Globaux & Diagrammes de Séquence

### Exemple de flux transactionnel : Réservation et Paiement d'un vol

Le diagramme suivant illustre le flux complet de la création d'une réservation à son paiement et à la génération du ticket PDF :

```mermaid
sequenceDiagram
    participant Client as Client (React)
    participant API as API Serveur (Express)
    participant DB as Base de Données (MySQL)
    participant SMTP as Service SMTP Mailtrap

    Client->>API: POST /api/reservations/flight { flightId, seatsBooked, seatClass }
    Note over API: Valide l'authentification & la disponibilité des sièges
    API->>DB: create reservation (status: PENDING) & update availableSeats
    DB-->>API: Enregistrement OK
    API-->>Client: Retourne la Réservation avec ID
    
    Client->>API: POST /api/payments { reservationId, cardInfo }
    Note over API: Valide la transaction de paiement simulée
    API->>DB: update reservation status to CONFIRMED
    API->>DB: create payment record (status: PAID)
    DB-->>API: Enregistrements mis à jour
    API-->>Client: Retourne le statut de confirmation
    
    Note over Client: Génération dynamique du PDF en local (generatePDF.ts)
    Client->>Client: Génère le QR Code unique (ID transaction) et dessine le billet PDF
    Client-->>Client: Téléchargement automatique du billet PDF pour le passager
```

---

## 7. Architecture Réseau & Déploiement

Pour la mise en production, l'infrastructure est orchestrée à l'aide de conteneurs **Docker** garantissant la reproductibilité parfaite du système sur n'importe quel serveur cloud (AWS, DigitalOcean, VPS).

### Schéma de déploiement en conteneurs
```text
                  Internet (Navigateur Client)
                               │ (HTTPS)
                               ▼
                      ┌──────────────────┐
                      │   Reverse Proxy  │ (Nginx)
                      └────────┬─────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼ (HTTP / Port 3000)            ▼ (HTTP / Port 5000)
     ┌──────────────────┐            ┌──────────────────┐
     │  Conteneur Web   │            │  Conteneur API   │
     │     Next.js      │            │    Express.js    │
     └──────────────────┘            └─────────┬────────┘
                                               │ (Port 3306)
                                               ▼
                                     ┌──────────────────┐
                                     │ Conteneur BDD    │
                                     │      MySQL       │
                                     └──────────────────┘
```

*   **Nginx Reverse Proxy** : Fait office de point d'entrée unique. Il gère le chiffrement SSL/TLS (HTTPS) et redirige le trafic réseau vers le conteneur frontend ou backend approprié.
*   **Docker Compose** : Coordonne le démarrage ordonné des conteneurs (la base de données MySQL démarre en premier, suivie des tests de migration Prisma, puis du serveur Express, et enfin du build Next.js).
