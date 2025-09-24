import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  fr: {
    translation: {
      // App structure
      "BigMind": "BigMind",
      "MindMap": "Carte Mentale",
      "Settings": "Paramètres",
      
      // Topbar
      "Add Child": "Ajouter Enfant",
      "Add Sibling": "Ajouter Frère",
      
      // Sidebar
      "Outline": "Arborescence",
      "Properties": "Propriétés",
      "No node selected": "Aucun nœud sélectionné",
      "ID": "ID",
      "Label": "Libellé",
      
      // Settings
      "Language": "Langue",
      "Theme": "Thème",
      "Light": "Clair",
      "Dark": "Sombre",
      "Nord": "Nord",
      "Gruvbox": "Gruvbox",
      "Show sidebar toggles": "Afficher les boutons de toggle",
      "Collapse duration (ms)": "Durée collapse (ms)",
      
      // Status bar
      "Zoom": "Zoom",
      "Language:": "Langue:",
      "Selection:": "Sélection:",
      
      // Tooltips and labels
      "Hide right panel": "Masquer panneau droit",
      "Show right panel": "Afficher panneau droit",
      "Hide left panel": "Masquer panneau gauche", 
      "Show left panel": "Afficher panneau gauche",
      "Zoom out": "Zoom arrière",
      "Zoom in": "Zoom avant",
      "Reset zoom": "Reset zoom",
      "Expand": "Déplier",
      "Collapse": "Replier",
      
      // Node actions
      "New Node": "Nouveau Nœud",
      "Child": "Enfant",
      
      // Badges
      "Note": "Note",
      "Link": "Lien",
      "Task": "Tâche"
      ,"menu.file":"Fichier","menu.edit":"Édition","menu.view":"Affichage","menu.help":"Aide","menu.newTab":"Nouvel onglet","menu.open":"Ouvrir","menu.save":"Enregistrer","menu.saveAs":"Enregistrer sous","menu.cut":"Couper","menu.copy":"Copier","menu.paste":"Coller","menu.zoomIn":"Zoom avant","menu.zoomOut":"Zoom arrière","menu.resetZoom":"Réinitialiser le zoom","menu.about":"À propos"
    }
  },
  en: {
    translation: {
      // App structure
      "BigMind": "BigMind",
      "MindMap": "Mind Map",
      "Settings": "Settings",
      
      // Topbar
      "Add Child": "Add Child",
      "Add Sibling": "Add Sibling",
      
      // Sidebar
      "Outline": "Outline",
      "Properties": "Properties", 
      "No node selected": "No node selected",
      "ID": "ID",
      "Label": "Label",
      
      // Settings
      "Language": "Language",
      "Theme": "Theme",
      "Light": "Light",
      "Dark": "Dark",
      "Nord": "Nord",
      "Gruvbox": "Gruvbox",
      "Show sidebar toggles": "Show sidebar toggles",
      "Collapse duration (ms)": "Collapse duration (ms)",
      
      // Status bar
      "Zoom": "Zoom",
      "Language:": "Language:",
      "Selection:": "Selection:",
      
      // Tooltips and labels
      "Hide right panel": "Hide right panel",
      "Show right panel": "Show right panel",
      "Hide left panel": "Hide left panel",
      "Show left panel": "Show left panel", 
      "Zoom out": "Zoom out",
      "Zoom in": "Zoom in",
      "Reset zoom": "Reset zoom",
      "Expand": "Expand",
      "Collapse": "Collapse",
      
      // Node actions
      "New Node": "New Node",
      "Child": "Child",
      
      // Badges
      "Note": "Note",
      "Link": "Link", 
      "Task": "Task"
      ,"menu.file":"File","menu.edit":"Edit","menu.view":"View","menu.help":"Help","menu.newTab":"New tab","menu.open":"Open","menu.save":"Save","menu.saveAs":"Save as","menu.cut":"Cut","menu.copy":"Copy","menu.paste":"Paste","menu.zoomIn":"Zoom in","menu.zoomOut":"Zoom out","menu.resetZoom":"Reset zoom","menu.about":"About"
    }
  },
  es: {
    translation: {
      // App structure
      "BigMind": "BigMind",
      "MindMap": "Mapa Mental",
      "Settings": "Configuración",
      
      // Topbar
      "Add Child": "Añadir Hijo",
      "Add Sibling": "Añadir Hermano",
      
      // Sidebar
      "Outline": "Esquema",
      "Properties": "Propiedades",
      "No node selected": "Ningún nodo seleccionado",
      "ID": "ID",
      "Label": "Etiqueta",
      
      // Settings
      "Language": "Idioma",
      "Theme": "Tema",
      "Light": "Claro",
      "Dark": "Oscuro",
      "Nord": "Nord",
      "Gruvbox": "Gruvbox",
      "Show sidebar toggles": "Mostrar botones de alternar",
      "Collapse duration (ms)": "Duración colapso (ms)",
      
      // Status bar
      "Zoom": "Zoom",
      "Language:": "Idioma:",
      "Selection:": "Selección:",
      
      // Tooltips and labels
      "Hide right panel": "Ocultar panel derecho",
      "Show right panel": "Mostrar panel derecho",
      "Hide left panel": "Ocultar panel izquierdo",
      "Show left panel": "Mostrar panel izquierdo",
      "Zoom out": "Alejar zoom",
      "Zoom in": "Acercar zoom", 
      "Reset zoom": "Restablecer zoom",
      "Expand": "Expandir",
      "Collapse": "Colapsar",
      
      // Node actions
      "New Node": "Nuevo Nodo",
      "Child": "Hijo",
      
      // Badges
      "Note": "Nota",
      "Link": "Enlace",
      "Task": "Tarea"
      ,"menu.file":"Archivo","menu.edit":"Editar","menu.view":"Ver","menu.help":"Ayuda","menu.newTab":"Nueva pestaña","menu.open":"Abrir","menu.save":"Guardar","menu.saveAs":"Guardar como","menu.cut":"Cortar","menu.copy":"Copiar","menu.paste":"Pegar","menu.zoomIn":"Acercar","menu.zoomOut":"Alejar","menu.resetZoom":"Restablecer zoom","menu.about":"Acerca de"
    }
  },
  de: {
    translation: {
      // App structure
      "BigMind": "BigMind",
      "MindMap": "Mind Map",
      "Settings": "Einstellungen",
      
      // Topbar
      "Add Child": "Kind hinzufügen",
      "Add Sibling": "Geschwister hinzufügen",
      
      // Sidebar
      "Outline": "Gliederung",
      "Properties": "Eigenschaften",
      "No node selected": "Kein Knoten ausgewählt",
      "ID": "ID", 
      "Label": "Bezeichnung",
      
      // Settings
      "Language": "Sprache",
      "Theme": "Design",
      "Light": "Hell",
      "Dark": "Dunkel",
      "Nord": "Nord",
      "Gruvbox": "Gruvbox",
      "Show sidebar toggles": "Seitenleisten-Schalter anzeigen",
      "Collapse duration (ms)": "Einklappdauer (ms)",
      
      // Status bar
      "Zoom": "Zoom",
      "Language:": "Sprache:",
      "Selection:": "Auswahl:",
      
      // Tooltips and labels
      "Hide right panel": "Rechtes Panel ausblenden",
      "Show right panel": "Rechtes Panel anzeigen",
      "Hide left panel": "Linkes Panel ausblenden",
      "Show left panel": "Linkes Panel anzeigen",
      "Zoom out": "Herauszoomen",
      "Zoom in": "Hineinzoomen",
      "Reset zoom": "Zoom zurücksetzen",
      "Expand": "Erweitern",
      "Collapse": "Einklappen",
      
      // Node actions
      "New Node": "Neuer Knoten",
      "Child": "Kind",
      
      // Badges
      "Note": "Notiz",
      "Link": "Link",
      "Task": "Aufgabe"
      ,"menu.file":"Datei","menu.edit":"Bearbeiten","menu.view":"Ansicht","menu.help":"Hilfe","menu.newTab":"Neuer Tab","menu.open":"Öffnen","menu.save":"Speichern","menu.saveAs":"Speichern unter","menu.cut":"Ausschneiden","menu.copy":"Kopieren","menu.paste":"Einfügen","menu.zoomIn":"Hineinzoomen","menu.zoomOut":"Herauszoomen","menu.resetZoom":"Zoom zurücksetzen","menu.about":"Über"
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
