export const fr = {
  common: {
    navbar: {
      home: "Accueil",
      flights: "Vols",
      hotels: "Hôtels",
      bookings: "Réservations",
      dashboard: "Tableau de bord",
      profile: "Profil",
      login: "Connexion",
      register: "Inscription",
      logout: "Déconnexion",
      notifications: "Notifications",
      markAllRead: "Tout marquer comme lu",
      clearAll: "Effacer tout",
      noNotifications: "Aucune notification",
      confirmClear: "Effacer toutes les notifications ? 🧹",
      start: "Commencer"
    },
    footer: {
      description: "Réservez des vols et des hôtels au meilleur prix. Paiement sécurisé, confirmation instantanée et assistance 24/7.",
      rights: "© {year} FlightHotel. Tous droits réservés."
    },
    roles: {
      ADMIN: "Administrateur",
      HOTEL_MANAGER: "Gestionnaire d'Hôtel",
      FLIGHT_MANAGER: "Gestionnaire de Vols",
      CLIENT: "Client"
    },
    status: {
      SCHEDULED: "Programmé",
      BOARDING: "Embarquement",
      DEPARTED: "Parti",
      ARRIVED: "Arrivé",
      CANCELLED: "Annulé",
      DELAYED: "Retardé",
      CONFIRMED: "Confirmé",
      PENDING: "En attente",
      PAID: "Payé",
      REFUNDED: "Remboursé",
      FAILED: "Échoué"
    },
    loading: "Chargement...",
    submitting: "Traitement en cours...",
    cancel: "Annuler",
    save: "Enregistrer les modifications",
    actions: "Actions",
    back: "Retour"
  },
  home: {
    hero: {
      title: "Votre voyage commence ici",
      subtitle: "Découvrez les meilleures offres sur les vols et les hôtels dans le monde entier.",
      searchFlights: "Rechercher des vols",
      searchHotels: "Rechercher des hôtels"
    },
    searchForm: {
      from: "De",
      fromPlaceholder: "Ville de départ",
      to: "À",
      toPlaceholder: "Destination",
      date: "Date",
      passengers: "Passagers",
      search: "Rechercher",
      city: "Ville",
      cityPlaceholder: "Ville de destination",
      checkIn: "Arrivée",
      checkOut: "Départ",
      guests: "Voyageurs"
    },
    features: {
      bestPrice: "Garantie du meilleur prix",
      bestPriceDesc: "Vous trouvez moins cher ailleurs ? Nous nous alignons et vous offrons une remise supplémentaire.",
      support: "Support 24/7",
      supportDesc: "Notre équipe d'assistance dédiée est toujours là pour vous aider durant vos voyages.",
      booking: "Réservation simple",
      bookingDesc: "Réservez des vols et des hôtels en quelques clics grâce à des paiements sécurisés."
    }
  },
  auth: {
    login: {
      title: "Ravi de vous revoir",
      subtitle: "Connectez-vous pour gérer vos réservations et votre profil",
      email: "Adresse e-mail",
      password: "Mot de passe",
      button: "Se connecter",
      noAccount: "Vous n'avez pas de compte ?",
      signUp: "S'inscrire",
      forgotPass: "Mot de passe oublié ?",
      success: "Connexion réussie ! 👋",
      error: "Identifiants invalides"
    },
    register: {
      title: "Créer un compte",
      subtitle: "Rejoignez-nous pour commencer à réserver vos vols et hôtels",
      firstName: "Prénom",
      lastName: "Nom",
      phone: "Numéro de téléphone",
      email: "Adresse e-mail",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      button: "S'inscrire",
      haveAccount: "Vous avez déjà un compte ?",
      signIn: "Se connecter",
      success: "Inscription réussie ! 🎉",
      error: "Échec de l'inscription"
    },
    forgot: {
      title: "Mot de passe oublié",
      subtitle: "Saisissez votre e-mail pour recevoir un lien de réinitialisation",
      email: "Adresse e-mail",
      button: "Envoyer le lien",
      backToLogin: "Retour à la connexion",
      success: "Lien envoyé ! Consultez votre boîte de réception.",
      error: "Échec de l'envoi du lien"
    },
    reset: {
      title: "Réinitialiser le mot de passe",
      subtitle: "Saisissez et confirmez votre nouveau mot de passe ci-dessous",
      password: "Nouveau mot de passe",
      confirm: "Confirmer le mot de passe",
      button: "Réinitialiser",
      success: "Mot de passe réinitialisé avec succès ! 🎉",
      error: "Échec de la réinitialisation"
    }
  },
  flights: {
    search: {
      title: "Rechercher des vols",
      results: "{count} vol{s} trouvé{s}",
      searching: "Recherche en cours...",
      pricePerPerson: "par personne",
      noFlights: "Aucun vol trouvé",
      noFlightsDesc: "Essayez de modifier vos critères de recherche",
      seatsLeft: "{count} places restantes"
    },
    filters: {
      title: "Filtres",
      priceRange: "Gamme de prix",
      min: "Min",
      max: "Max",
      airline: "Compagnie aérienne",
      allAirlines: "Toutes les compagnies",
      clear: "Effacer les filtres"
    }
  },
  hotels: {
    search: {
      title: "Rechercher des hôtels",
      results: "{count} hôtel{s} trouvé{s}",
      searching: "Recherche en cours...",
      pricePerNight: "dès {price}/nuit",
      onRequest: "Chambres sur demande",
      noHotels: "Aucun hôtel trouvé",
      noHotelsDesc: "Essayez de modifier vos critères de recherche",
      roomsCount: "{count} chambres"
    },
    filters: {
      title: "Filtres",
      stars: "Étoiles",
      anyStars: "Toutes les étoiles",
      andUp: "et plus",
      pricePerNight: "Prix par nuit",
      clear: "Effacer les filtres"
    }
  },
  profile: {
    title: "Mon Profil",
    subtitle: "Gérez vos informations personnelles",
    personalInfo: "Informations personnelles",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Adresse e-mail",
    phone: "Numéro de téléphone",
    role: "Rôle utilisateur",
    memberSince: "Membre depuis",
    editBtn: "Modifier le profil",
    cancelBtn: "Annuler",
    saveBtn: "Enregistrer les modifications",
    success: "Profil mis à jour avec succès ! 🎉",
    error: "Échec de la mise à jour du profil"
  },
  reservations: {
    title: "Mes Réservations",
    subtitle: "Gérez vos réservations de vols et d'hôtels",
    flightsTab: "Vols",
    hotelsTab: "Hôtels",
    empty: "Aucune réservation trouvée",
    emptyDesc: "Commencez à explorer des vols et des hôtels pour réserver !",
    flightCard: {
      seats: "Places : {count}",
      class: "Classe : {class}",
      amount: "Montant",
      download: "Télécharger le billet",
      cancel: "Annuler le vol"
    },
    hotelCard: {
      room: "Chambre {roomNumber} ({type})",
      checkIn: "Arrivée",
      checkOut: "Départ",
      amount: "Montant",
      download: "Télécharger le bon",
      cancel: "Annuler la réservation"
    },
    cancellation: {
      confirm: "Êtes-vous sûr de vouloir annuler cette réservation ?",
      success: "Réservation annulée avec succès ! 💸",
      error: "Échec de l'annulation de la réservation"
    }
  },
  payment: {
    title: "Finaliser le paiement",
    summary: "Récapitulatif de la réservation",
    secure: "Paiement sécurisé",
    ssl: "SSL 256-bit",
    methodCard: "💳 Carte",
    methodPaypal: "🅿️ PayPal",
    cardHolder: "Nom du titulaire de la carte",
    cardNumber: "Numéro de carte",
    expiryMonth: "Mois",
    expiryYear: "Année",
    cvv: "CVV",
    simulated: "⚠️ Paiement simulé — utilisez n'importe quel format de carte valide",
    payBtn: "Payer {amount}",
    payNow: "Payer maintenant",
    success: {
      title: "Paiement réussi !",
      transaction: "ID de transaction",
      instruction: "Consultez vos e-mails pour obtenir votre {type}.",
      boardingPass: "carte d'accès à bord",
      voucher: "bon d'hôtel",
      downloadBtn: "Télécharger le PDF",
      viewBookings: "Voir les réservations",
      toast: "Paiement réussi ! 🎉"
    },
    errors: {
      fields: "Veuillez remplir tous les champs de paiement",
      failed: "Échec du paiement"
    }
  },
  dashboard: {
    admin: {
      title: "Tableau de bord",
      welcome: "Ravi de vous revoir, {name} — {role}",
      users: "Utilisateurs",
      bookings: "Réservations",
      revenue: "Chiffre d'Affaires",
      activeFlights: "Vols Actifs",
      recentFlights: "Réservations de vols récentes",
      recentUsers: "Utilisateurs récents",
      monthlyReservations: "Réservations mensuelles",
      monthlyRevenue: "Chiffre d'Affaires Mensuel",
      revenueByHotel: "Revenu par Hôtel",
      revenueByAirline: "Revenu par Compagnie"
    },
    flightManager: {
      title: "Tableau de Bord du Gestionnaire de Vols",
      subtitle: "Ravi de vous revoir, {name}. Aperçu des vols actifs.",
      recentFlights: "Vols récents",
      table: {
        flight: "Vol",
        route: "Itinéraire",
        departure: "Départ",
        seats: "Sièges",
        status: "Statut"
      }
    },
    hotelManager: {
      title: "Tableau de Bord du Gestionnaire d'Hôtels",
      subtitle: "Ravi de vous revoir, {name}. Voici un aperçu de vos établissements.",
      noProperties: "Aucun établissement pour le moment",
      noPropertiesDesc: "Aucun hôtel ne vous a encore été attribué. Contactez l'administrateur.",
      totalRooms: "Chambres",
      reservations: "Réservations",
      roomsSection: "Chambres",
      roomNumber: "Chambre {number}",
      capacity: "Cap. : {capacity}",
      available: "Disponible",
      booked: "Réservée",
      moreRooms: "+ {count} autres chambres"
    }
  }
};
