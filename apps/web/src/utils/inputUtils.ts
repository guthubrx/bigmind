/**
 * FR: Utilitaires pour gérer les interactions avec les champs de saisie
 * EN: Utilities for handling input field interactions
 */

/**
 * FR: Vérifie si l'élément actif est un champ de saisie
 * EN: Checks if the active element is an input field
 */
export function isInputField(element: Element | null): boolean {
  if (!element) return false;
  
  const tagName = element.tagName.toLowerCase();
  const inputTypes = ['input', 'textarea', 'select'];
  
  // Vérifier les balises de saisie
  if (inputTypes.includes(tagName)) {
    return true;
  }
  
  // Vérifier si l'élément a l'attribut contenteditable
  if (element.hasAttribute('contenteditable') && element.getAttribute('contenteditable') !== 'false') {
    return true;
  }
  
  // Vérifier si l'élément a le rôle d'input
  const role = element.getAttribute('role');
  if (role && ['textbox', 'searchbox', 'combobox'].includes(role)) {
    return true;
  }
  
  return false;
}

/**
 * FR: Vérifie si l'utilisateur tape dans un champ de saisie
 * EN: Checks if user is typing in an input field
 */
export function isTypingInInput(): boolean {
  return isInputField(document.activeElement);
}

/**
 * FR: Vérifie si un raccourci a des modificateurs
 * EN: Checks if a shortcut has modifiers
 */
export function hasModifiers(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
}

/**
 * FR: Vérifie si un raccourci doit être ignoré quand on tape dans un champ
 * EN: Checks if a shortcut should be ignored when typing in a field
 */
export function shouldIgnoreShortcut(event: KeyboardEvent): boolean {
  // Toujours autoriser les raccourcis avec modificateurs
  if (hasModifiers(event)) {
    return false;
  }
  
  // Ignorer les raccourcis sans modificateurs si on tape dans un champ
  return isTypingInInput();
}
