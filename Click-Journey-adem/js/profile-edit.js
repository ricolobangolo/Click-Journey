document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de profile-edit.js');
    
    // Sélectionner tous les champs de profil
    const profileFields = document.querySelectorAll('.champ-profil');
    
    profileFields.forEach(field => {
        // Éléments du champ
        const form = field.querySelector('form');
        const input = field.querySelector('input[name="value"]');
        const fieldName = field.querySelector('input[name="field"]').value;
        const saveBtn = field.querySelector('.btn-save');
        
        if (!form || !input || !fieldName || !saveBtn) {
            console.error('Elements manquants pour un champ:', field);
            return;
        }
        
        // Désactiver l'entrée initialement et cacher le bouton de sauvegarde
        input.disabled = true;
        saveBtn.style.display = 'none';
        
        // Créer les boutons d'édition
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.classList.add('btn-edit');
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Modifier';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.type = 'button';
        confirmBtn.classList.add('btn-confirm');
        confirmBtn.innerHTML = '✓';
        confirmBtn.title = 'Valider';
        confirmBtn.style.display = 'none';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.classList.add('btn-cancel');
        cancelBtn.innerHTML = '✗';
        cancelBtn.title = 'Annuler';
        cancelBtn.style.display = 'none';
        
        // Ajouter les boutons au formulaire
        form.appendChild(editBtn);
        form.appendChild(confirmBtn);
        form.appendChild(cancelBtn);
        
        // Mémoriser la valeur originale
        let originalValue = input.value;
        
        // Fonction pour afficher une notification
        function showNotification(message, isError = false) {
            const notif = document.createElement('div');
            notif.className = isError ? 'error-message' : 'success-message';
            notif.textContent = message;
            notif.style.position = 'fixed';
            notif.style.top = '20px';
            notif.style.left = '50%';
            notif.style.transform = 'translateX(-50%)';
            notif.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
            notif.style.color = isError ? '#721c24' : '#155724';
            notif.style.padding = '10px 20px';
            notif.style.borderRadius = '5px';
            notif.style.zIndex = '1000';
            
            document.body.appendChild(notif);
            
            setTimeout(() => {
                notif.style.opacity = '0';
                notif.style.transition = 'opacity 0.5s';
                setTimeout(() => notif.remove(), 500);
            }, 3000);
        }
        
        // Fonction pour valider le champ
        function validateField(value) {
            if (fieldName === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value) ? null : "L'adresse email n'est pas valide";
            }
            
            if (fieldName === 'login') {
                if (value.length < 3) return "Login trop court (min. 3 caractères)";
                if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Le login ne peut contenir que des lettres, chiffres et underscore";
                return null;
            }
            
            if (fieldName === 'nom' || fieldName === 'prenom') {
                if (value.length < 2) return "Doit contenir au moins 2 caractères";
                if (!/^[a-zA-Z\s\'-]+$/.test(value)) return "Ne peut contenir que des lettres, espaces, apostrophes et tirets";
                return null;
            }
            
            if (fieldName === 'password') {
                if (value === '••••••••') return null;
                if (value.length < 8) return "Le mot de passe doit contenir au moins 8 caractères";
                return null;
            }
            
            if (fieldName === 'telephone') {
                if (!/^[0-9]{10}$/.test(value)) return "Le numéro doit contenir 10 chiffres";
                return null;
            }
            
            if (fieldName === 'date_naissance') {
                const date = new Date(value);
                const now = new Date();
                if (date > now) return "La date ne peut pas être dans le futur";
                return null;
            }
            
            return null;
        }
        
        // Fonction pour soumettre les modifications
        function submitChange() {
            // Valider d'abord
            const error = validateField(input.value);
            if (error) {
                showNotification(error, true);
                return;
            }
            
            // Désactiver les boutons pendant la soumission
            saveBtn.disabled = true;
            confirmBtn.disabled = true;
            cancelBtn.disabled = true;
            
            // Afficher un indicateur de chargement
            confirmBtn.innerHTML = '⏳';
            
            // Préparer la requête AJAX
            const formData = new FormData();
            formData.append('field', fieldName);
            formData.append('value', input.value);
            
            // Ajouter l'en-tête pour les requêtes AJAX
            const headers = new Headers({
                'X-Requested-With': 'XMLHttpRequest'
            });
            
            // Effectuer la requête AJAX
            fetch('../php/profile/update_profile.php', {
                method: 'POST',
                headers: headers,
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur réseau');
                }
                return response.json();
            })
            .then(data => {
                // Mise à jour de l'interface selon la réponse
                if (data.success) {
                    showNotification(data.message || 'Modification réussie');
                    
                    // Mettre à jour la valeur originale
                    originalValue = input.value;
                    
                    // Si c'est un mot de passe, afficher des astérisques
                    if (fieldName === 'password') {
                        input.value = '••••••••';
                    }
                    
                    // Mettre l'interface en mode lecture
                    input.disabled = true;
                    editBtn.style.display = 'inline';
                    confirmBtn.style.display = 'none';
                    cancelBtn.style.display = 'none';
                    saveBtn.style.display = 'none';
                } else {
                    showNotification(data.message || 'Erreur lors de la modification', true);
                    
                    // Réactiver les contrôles
                    confirmBtn.innerHTML = '✓';
                    confirmBtn.disabled = false;
                    cancelBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                showNotification('Erreur de communication avec le serveur', true);
                
                // Réactiver les contrôles
                confirmBtn.innerHTML = '✓';
                confirmBtn.disabled = false;
                cancelBtn.disabled = false;
            })
            .finally(() => {
                saveBtn.disabled = false;
            });
        }
        
        // Gestionnaire d'événement pour le bouton d'édition
        editBtn.addEventListener('click', function() {
            // Spécial pour le mot de passe
            if (fieldName === 'password') {
                input.value = '';
                
                // Récupérer le vrai mot de passe si nécessaire
                fetch('../php/profile/get_current_password.php')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            originalValue = data.password;
                        }
                    })
                    .catch(error => console.error('Erreur:', error));
            }
            
            // Activer le champ et montrer les boutons de confirmation/annulation
            input.disabled = false;
            input.focus();
            
            editBtn.style.display = 'none';
            confirmBtn.style.display = 'inline';
            cancelBtn.style.display = 'inline';
            saveBtn.style.display = 'inline';
        });
        
        // Gestionnaire d'événement pour le bouton de confirmation
        confirmBtn.addEventListener('click', submitChange);
        
        // Gestionnaire d'événement pour le bouton d'annulation
        cancelBtn.addEventListener('click', function() {
            // Restaurer la valeur originale
            if (fieldName === 'password') {
                input.value = '••••••••';
            } else {
                input.value = originalValue;
            }
            
            // Désactiver le champ et cacher les boutons de confirmation/annulation
            input.disabled = true;
            editBtn.style.display = 'inline';
            confirmBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            saveBtn.style.display = 'none';
        });
        
        // Gestionnaire pour la touche Entrée
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !input.disabled) {
                e.preventDefault();
                submitChange();
            }
        });
        
        // Gestionnaire pour le bouton de sauvegarde
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            submitChange();
        });
    });
});
