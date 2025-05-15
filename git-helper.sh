#!/bin/bash

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher le menu
show_menu() {
    echo -e "${GREEN}=== Git Helper ===${NC}"
    echo "1. Faire un commit et push"
    echo "2. Fusionner (merge) une branche"
    echo "3. Supprimer une branche locale"
    echo "4. Supprimer une branche distante"
    echo "5. Changer de branche"
    echo "6. Créer une nouvelle branche"
    echo "7. Afficher les branches locales et distantes"
    echo "8. Pull les derniers changements"
    echo "9. Résoudre les conflits de merge"
    echo "10. Status du dépôt"
    echo "11. Log des commits"
    echo "12. Stash des modifications"
    echo "13. Unstash des modifications"
    echo "14. Annuler le dernier commit"
    echo "15. Tag une version"
    echo "16. Voir les remotes"
    echo "17. Ajouter un remote"
    echo "18. Initialiser un nouveau dépôt"
    echo "19. Quitter"
    echo -n "Choisis une option (1-19): "
}

# Fonction pour commit + push
commit_and_push() {
    echo -n "Message de commit : "
    read commit_message
    git add .
    git commit -m "$commit_message"
    current_branch=$(git branch --show-current)
    echo -e "${YELLOW}Pushing to ${current_branch}...${NC}"
    git push origin "$current_branch"
    echo -e "${GREEN}✔ Commit & Push réussis.${NC}"
}

# Fonction pour merger une branche
merge_branch() {
    git fetch
    echo "Branches disponibles :"
    git branch -a
    echo -n "Nom de la branche à merger : "
    read branch_to_merge
    git merge "$branch_to_merge"
    
    # Vérifier si le merge a réussi
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✔ Fusion réussie.${NC}"
    else
        echo -e "${RED}⚠ Fusion avec des conflits. Utilisez l'option 9 pour résoudre les conflits.${NC}"
    fi
}

# Fonction pour supprimer une branche locale
delete_local_branch() {
    git branch
    echo -n "Nom de la branche locale à supprimer : "
    read branch_to_delete
    
    # Vérifier si on est sur la branche à supprimer
    current_branch=$(git branch --show-current)
    if [ "$current_branch" = "$branch_to_delete" ]; then
        echo -e "${RED}⚠ Vous êtes actuellement sur cette branche. Changez de branche d'abord.${NC}"
        return
    fi
    
    # Demander confirmation avec -D pour forcer si nécessaire
    echo -e "${YELLOW}Supprimer avec -d (sécurisé) ou -D (forcé) ? [d/D] : ${NC}"
    read delete_option
    
    if [ "$delete_option" = "D" ]; then
        git branch -D "$branch_to_delete"
    else
        git branch -d "$branch_to_delete"
    fi
    
    echo -e "${GREEN}✔ Branche locale supprimée.${NC}"
}

# Fonction pour supprimer une branche distante
delete_remote_branch() {
    git fetch --all
    echo "Branches distantes disponibles :"
    git branch -r
    echo -n "Nom de la branche distante à supprimer (ex: origin/ma-branche) : "
    read remote_branch_to_delete
    git push origin --delete "${remote_branch_to_delete#origin/}"
    echo -e "${GREEN}✔ Branche distante supprimée.${NC}"
}

# Fonction pour changer de branche
switch_branch() {
    git fetch
    echo "Branches disponibles :"
    git branch -a
    echo -n "Nom de la branche vers laquelle basculer : "
    read branch_to_switch
    
    # Vérifier si des modifications non commitées existent
    if [[ -n $(git status --porcelain) ]]; then
        echo -e "${YELLOW}⚠ Des modifications non commitées existent. Que faire ? ${NC}"
        echo "1. Stash les modifications et changer de branche"
        echo "2. Forcer le changement (peut perdre des modifications)"
        echo "3. Annuler le changement de branche"
        echo -n "Choix : "
        read stash_choice
        
        case $stash_choice in
            1) 
                git stash save "Auto-stash avant checkout vers $branch_to_switch"
                git checkout "$branch_to_switch"
                echo -e "${GREEN}✔ Modifications stashées et changement de branche réussi.${NC}"
                ;;
            2)
                git checkout -f "$branch_to_switch"
                echo -e "${YELLOW}⚠ Changement forcé, certaines modifications peuvent être perdues.${NC}"
                ;;
            *)
                echo -e "${YELLOW}Changement de branche annulé.${NC}"
                return
                ;;
        esac
    else
        git checkout "$branch_to_switch"
        echo -e "${GREEN}✔ Changement de branche réussi.${NC}"
    fi
}

# Fonction pour créer une nouvelle branche
create_branch() {
    echo -n "Nom de la nouvelle branche : "
    read new_branch_name
    git checkout -b "$new_branch_name"
    
    echo -e "${YELLOW}Pousser cette nouvelle branche vers origin ? [y/n] : ${NC}"
    read push_choice
    
    if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
        git push -u origin "$new_branch_name"
        echo -e "${GREEN}✔ Nouvelle branche créée, basculée et poussée vers origin.${NC}"
    else
        echo -e "${GREEN}✔ Nouvelle branche créée et basculée localement.${NC}"
    fi
}

# Fonction pour afficher les branches
show_branches() {
    echo -e "${YELLOW}=== Branches locales ===${NC}"
    git branch
    echo -e "${YELLOW}=== Branches distantes ===${NC}"
    git branch -r
}

# Fonction pour pull les derniers changements
pull_changes() {
    current_branch=$(git branch --show-current)
    echo -e "${YELLOW}Pulling ${current_branch}...${NC}"
    git pull origin "$current_branch"
    echo -e "${GREEN}✔ Pull réussi.${NC}"
}

# Nouvelle fonction pour résoudre les conflits de merge
resolve_conflicts() {
    # Vérifier s'il y a des conflits
    if [ -z "$(git diff --name-only --diff-filter=U)" ]; then
        echo -e "${GREEN}✔ Pas de conflits à résoudre.${NC}"
        return
    fi
    
    echo -e "${YELLOW}=== Fichiers en conflit ===${NC}"
    git diff --name-only --diff-filter=U
    
    echo -e "${YELLOW}Comment résoudre les conflits ? ${NC}"
    echo "1. Utiliser un outil de merge (git mergetool)"
    echo "2. Accepter les changements locaux"
    echo "3. Accepter les changements distants"
    echo "4. Résoudre manuellement"
    echo -n "Choix : "
    read conflict_choice
    
    case $conflict_choice in
        1)
            git mergetool
            ;;
        2)
            git diff --name-only --diff-filter=U | xargs git checkout --ours
            git diff --name-only --diff-filter=U | xargs git add
            echo -e "${GREEN}✔ Conflits résolus avec les changements locaux.${NC}"
            ;;
        3)
            git diff --name-only --diff-filter=U | xargs git checkout --theirs
            git diff --name-only --diff-filter=U | xargs git add
            echo -e "${GREEN}✔ Conflits résolus avec les changements distants.${NC}"
            ;;
        4)
            echo -e "${YELLOW}Modifiez manuellement les fichiers en conflit.${NC}"
            echo -e "${YELLOW}Quand vous avez terminé, ajoutez-les avec 'git add' puis commitez.${NC}"
            return
            ;;
        *)
            echo -e "${RED}Option invalide.${NC}"
            return
            ;;
    esac
    
    # Vérifier si tous les conflits sont résolus
    if [ -z "$(git diff --name-only --diff-filter=U)" ]; then
        echo -e "${YELLOW}Voulez-vous commiter la résolution de conflit ? [y/n] : ${NC}"
        read commit_choice
        
        if [ "$commit_choice" = "y" ] || [ "$commit_choice" = "Y" ]; then
            git commit -m "Resolve merge conflicts"
            echo -e "${GREEN}✔ Résolution de conflits commitée.${NC}"
        fi
    else
        echo -e "${RED}⚠ Il reste des conflits non résolus.${NC}"
    fi
}

# Nouvelle fonction pour afficher le status
show_status() {
    echo -e "${BLUE}=== Status du dépôt ===${NC}"
    git status
    
    echo -e "${BLUE}=== Branch actuelle ===${NC}"
    echo -e "${GREEN}$(git branch --show-current)${NC}"
    
    echo -e "${BLUE}=== Modifications non stagées ===${NC}"
    git diff --stat
}

# Nouvelle fonction pour afficher les logs
show_logs() {
    echo -e "${BLUE}=== Historique des commits ===${NC}"
    echo -e "${YELLOW}Nombre de commits à afficher (appuyez sur Entrée pour 10) : ${NC}"
    read log_count
    
    # Valeur par défaut si rien n'est entré
    if [ -z "$log_count" ]; then
        log_count=10
    fi
    
    echo -e "${YELLOW}Format du log ? ${NC}"
    echo "1. Simple (une ligne par commit)"
    echo "2. Détaillé (avec changements)"
    echo "3. Graphique (arbre de branches)"
    echo -n "Choix : "
    read log_format
    
    case $log_format in
        1)
            git log --oneline --decorate -n "$log_count"
            ;;
        2)
            git log --stat -n "$log_count"
            ;;
        3)
            git log --graph --oneline --decorate --all -n "$log_count"
            ;;
        *)
            git log --oneline -n "$log_count"
            ;;
    esac
}

# Nouvelle fonction pour stash des modifications
stash_changes() {
    echo -e "${YELLOW}Description du stash (optionnel) : ${NC}"
    read stash_description
    
    if [ -z "$stash_description" ]; then
        git stash
    else
        git stash save "$stash_description"
    fi
    
    echo -e "${GREEN}✔ Modifications stashées.${NC}"
}

# Nouvelle fonction pour unstash (appliquer) des modifications
unstash_changes() {
    echo -e "${BLUE}=== Stashes disponibles ===${NC}"
    git stash list
    
    if [ -z "$(git stash list)" ]; then
        echo -e "${YELLOW}Pas de stash disponible.${NC}"
        return
    fi
    
    echo -e "${YELLOW}Que voulez-vous faire ? ${NC}"
    echo "1. Appliquer le dernier stash (conserver le stash)"
    echo "2. Pop le dernier stash (supprimer le stash)"
    echo "3. Appliquer un stash spécifique"
    echo "4. Pop un stash spécifique"
    echo "5. Supprimer un stash spécifique"
    echo -n "Choix : "
    read stash_choice
    
    case $stash_choice in
        1)
            git stash apply
            echo -e "${GREEN}✔ Dernier stash appliqué.${NC}"
            ;;
        2)
            git stash pop
            echo -e "${GREEN}✔ Dernier stash appliqué et supprimé.${NC}"
            ;;
        3)
            echo -n "Entrez l'index du stash (exemple: 0 pour stash@{0}) : "
            read stash_index
            git stash apply "stash@{$stash_index}"
            echo -e "${GREEN}✔ Stash@{$stash_index} appliqué.${NC}"
            ;;
        4)
            echo -n "Entrez l'index du stash (exemple: 0 pour stash@{0}) : "
            read stash_index
            git stash pop "stash@{$stash_index}"
            echo -e "${GREEN}✔ Stash@{$stash_index} appliqué et supprimé.${NC}"
            ;;
        5)
            echo -n "Entrez l'index du stash (exemple: 0 pour stash@{0}) : "
            read stash_index
            git stash drop "stash@{$stash_index}"
            echo -e "${GREEN}✔ Stash@{$stash_index} supprimé.${NC}"
            ;;
        *)
            echo -e "${RED}Option invalide.${NC}"
            ;;
    esac
}

# Nouvelle fonction pour annuler le dernier commit
undo_last_commit() {
    echo -e "${YELLOW}Comment annuler le dernier commit ? ${NC}"
    echo "1. Soft (préserver les modifications)"
    echo "2. Hard (supprimer les modifications)"
    echo -n "Choix : "
    read undo_choice
    
    case $undo_choice in
        1)
            git reset --soft HEAD~1
            echo -e "${GREEN}✔ Dernier commit annulé, modifications préservées.${NC}"
            ;;
        2)
            echo -e "${RED}⚠ ATTENTION: Cette action supprimera définitivement les modifications.${NC}"
            echo -e "${RED}⚠ Êtes-vous sûr ? [y/n] : ${NC}"
            read confirm
            
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                git reset --hard HEAD~1
                echo -e "${GREEN}✔ Dernier commit annulé, modifications supprimées.${NC}"
            else
                echo -e "${YELLOW}Annulation annulée.${NC}"
            fi
            ;;
        *)
            echo -e "${RED}Option invalide.${NC}"
            ;;
    esac
}

# Nouvelle fonction pour tag une version
tag_version() {
    echo -n "Nom du tag : "
    read tag_name
    
    echo -e "${YELLOW}Ajouter une description ? [y/n] : ${NC}"
    read tag_description_choice
    
    if [ "$tag_description_choice" = "y" ] || [ "$tag_description_choice" = "Y" ]; then
        echo -n "Description : "
        read tag_description
        git tag -a "$tag_name" -m "$tag_description"
    else
        git tag "$tag_name"
    fi
    
    echo -e "${YELLOW}Pousser le tag vers origin ? [y/n] : ${NC}"
    read push_tag_choice
    
    if [ "$push_tag_choice" = "y" ] || [ "$push_tag_choice" = "Y" ]; then
        git push origin "$tag_name"
        echo -e "${GREEN}✔ Tag créé et poussé vers origin.${NC}"
    else
        echo -e "${GREEN}✔ Tag créé localement.${NC}"
    fi
}

# Nouvelle fonction pour voir les remotes
show_remotes() {
    echo -e "${BLUE}=== Remotes configurés ===${NC}"
    git remote -v
}

# Nouvelle fonction pour ajouter un remote
add_remote() {
    echo -n "Nom du remote (ex: origin) : "
    read remote_name
    
    echo -n "URL du remote (ex: https://github.com/user/repo.git) : "
    read remote_url
    
    git remote add "$remote_name" "$remote_url"
    echo -e "${GREEN}✔ Remote ajouté.${NC}"
    
    echo -e "${YELLOW}Voulez-vous faire un fetch de ce remote ? [y/n] : ${NC}"
    read fetch_choice
    
    if [ "$fetch_choice" = "y" ] || [ "$fetch_choice" = "Y" ]; then
        git fetch "$remote_name"
        echo -e "${GREEN}✔ Remote récupéré.${NC}"
    fi
}

# Nouvelle fonction pour initialiser un nouveau dépôt
init_repo() {
    echo -e "${YELLOW}Initialiser un dépôt Git dans le répertoire courant ? [y/n] : ${NC}"
    read init_choice
    
    if [ "$init_choice" = "y" ] || [ "$init_choice" = "Y" ]; then
        git init
        echo -e "${GREEN}✔ Dépôt Git initialisé.${NC}"
        
        echo -e "${YELLOW}Ajouter un fichier .gitignore ? [y/n] : ${NC}"
        read gitignore_choice
        
        if [ "$gitignore_choice" = "y" ] || [ "$gitignore_choice" = "Y" ]; then
            echo -e "${YELLOW}Choisir un modèle de .gitignore : ${NC}"
            echo "1. Node.js"
            echo "2. Python"
            echo "3. Java"
            echo "4. C++"
            echo "5. Vide"
            echo -n "Choix : "
            read gitignore_template
            
            case $gitignore_template in
                1)
                    echo -e "# Node.js\nnode_modules/\nnpm-debug.log\nyarn-error.log\n.env\n.DS_Store" > .gitignore
                    ;;
                2)
                    echo -e "# Python\n__pycache__/\n*.py[cod]\n*$py.class\n.env\n.venv\nenv/\nvenv/\nENV/\n.DS_Store" > .gitignore
                    ;;
                3)
                    echo -e "# Java\n*.class\n*.jar\n*.war\ntarget/\n.idea/\n.settings/\n.classpath\n.project\n.DS_Store" > .gitignore
                    ;;
                4)
                    echo -e "# C++\n*.o\n*.obj\n*.exe\n*.out\n*.app\n.DS_Store" > .gitignore
                    ;;
                *)
                    touch .gitignore
                    ;;
            esac
            
            echo -e "${GREEN}✔ Fichier .gitignore créé.${NC}"
        fi
        
        echo -e "${YELLOW}Faire un commit initial ? [y/n] : ${NC}"
        read initial_commit_choice
        
        if [ "$initial_commit_choice" = "y" ] || [ "$initial_commit_choice" = "Y" ]; then
            git add .
            git commit -m "Initial commit"
            echo -e "${GREEN}✔ Commit initial réalisé.${NC}"
        fi
    else
        echo -e "${YELLOW}Initialisation annulée.${NC}"
    fi
}

# Boucle principale
while true; do
    show_menu
    read choice
    case $choice in
        1) commit_and_push ;;
        2) merge_branch ;;
        3) delete_local_branch ;;
        4) delete_remote_branch ;;
        5) switch_branch ;;
        6) create_branch ;;
        7) show_branches ;;
        8) pull_changes ;;
        9) resolve_conflicts ;;
        10) show_status ;;
        11) show_logs ;;
        12) stash_changes ;;
        13) unstash_changes ;;
        14) undo_last_commit ;;
        15) tag_version ;;
        16) show_remotes ;;
        17) add_remote ;;
        18) init_repo ;;
        19) echo -e "${GREEN}Bye!${NC}"; exit 0 ;;
        *) echo -e "${RED}Option invalide.${NC}" ;;
    esac
    echo ""
done