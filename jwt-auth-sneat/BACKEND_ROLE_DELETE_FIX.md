# Gestion de la Suppression de Rôles

## Comportement Actuel - Frontend

Le frontend a été configuré avec les règles suivantes:

### 1. Protection contre la suppression de rôles utilisés
- **Si un rôle est assigné à un ou plusieurs utilisateurs**: La suppression est **BLOQUÉE**
- Un message d'erreur affiche la liste des utilisateurs qui possèdent ce rôle
- L'utilisateur doit d'abord retirer manuellement le rôle de tous les utilisateurs avant de pouvoir le supprimer

### 2. Rafraîchissement automatique de la liste des rôles
- La liste des rôles disponibles est rafraîchie automatiquement quand on ouvre le modal d'affectation
- Cela garantit que les rôles supprimés n'apparaissent plus dans la liste
- Lorsqu'on revient sur la page Utilisateurs, les données sont rafraîchies

Cette approche est la plus sûre car elle empêche toute suppression accidentelle de rôles encore utilisés.

## Solution Recommandée - Backend

Il est fortement recommandé de modifier le backend pour gérer cette logique de manière atomique et sécurisée.

### Option 1: Suppression en Cascade (Recommandée)

Modifiez le contrôleur de rôles (`RolesController.cs`) pour retirer automatiquement le rôle de tous les utilisateurs avant de le supprimer:

```csharp
[HttpDelete("delete/{roleName}")]
public async Task<IActionResult> DeleteRole(string roleName)
{
    try
    {
        // Vérifier que le rôle existe
        var roleExists = await _roleManager.RoleExistsAsync(roleName);
        if (!roleExists)
        {
            return NotFound($"Le rôle '{roleName}' n'existe pas.");
        }

        // Protéger les rôles système
        if (roleName.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Le rôle 'Admin' ne peut pas être supprimé.");
        }

        // Récupérer tous les utilisateurs ayant ce rôle
        var usersInRole = await _userManager.GetUsersInRoleAsync(roleName);

        // Retirer le rôle de tous les utilisateurs
        foreach (var user in usersInRole)
        {
            var removeResult = await _userManager.RemoveFromRoleAsync(user, roleName);
            if (!removeResult.Succeeded)
            {
                _logger.LogWarning($"Échec du retrait du rôle '{roleName}' pour l'utilisateur {user.UserName}");
            }
        }

        // Supprimer le rôle
        var role = await _roleManager.FindByNameAsync(roleName);
        var result = await _roleManager.DeleteAsync(role);

        if (result.Succeeded)
        {
            _logger.LogInformation($"Rôle '{roleName}' supprimé avec succès. Retiré de {usersInRole.Count} utilisateur(s).");
            return Ok(new {
                message = $"Le rôle '{roleName}' a été supprimé avec succès.",
                usersAffected = usersInRole.Count
            });
        }

        return BadRequest(new { message = "Erreur lors de la suppression du rôle.", errors = result.Errors });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Erreur lors de la suppression du rôle '{roleName}'");
        return StatusCode(500, "Une erreur s'est produite lors de la suppression du rôle.");
    }
}
```

### Option 2: Utiliser une Transaction (Plus Robuste)

Pour garantir l'atomicité de l'opération, utilisez une transaction:

```csharp
[HttpDelete("delete/{roleName}")]
public async Task<IActionResult> DeleteRole(string roleName)
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        var roleExists = await _roleManager.RoleExistsAsync(roleName);
        if (!roleExists)
        {
            return NotFound($"Le rôle '{roleName}' n'existe pas.");
        }

        if (roleName.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Le rôle 'Admin' ne peut pas être supprimé.");
        }

        var usersInRole = await _userManager.GetUsersInRoleAsync(roleName);

        // Retirer le rôle de tous les utilisateurs
        foreach (var user in usersInRole)
        {
            var removeResult = await _userManager.RemoveFromRoleAsync(user, roleName);
            if (!removeResult.Succeeded)
            {
                await transaction.RollbackAsync();
                return BadRequest($"Erreur lors du retrait du rôle pour l'utilisateur {user.UserName}");
            }
        }

        // Supprimer le rôle
        var role = await _roleManager.FindByNameAsync(roleName);
        var result = await _roleManager.DeleteAsync(role);

        if (!result.Succeeded)
        {
            await transaction.RollbackAsync();
            return BadRequest(new { message = "Erreur lors de la suppression du rôle.", errors = result.Errors });
        }

        await transaction.CommitAsync();

        _logger.LogInformation($"Rôle '{roleName}' supprimé avec succès. Retiré de {usersInRole.Count} utilisateur(s).");
        return Ok(new {
            message = $"Le rôle '{roleName}' a été supprimé avec succès.",
            usersAffected = usersInRole.Count
        });
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        _logger.LogError(ex, $"Erreur lors de la suppression du rôle '{roleName}'");
        return StatusCode(500, "Une erreur s'est produite lors de la suppression du rôle.");
    }
}
```

### Option 3: Configuration en Base de Données (Si vous utilisez Entity Framework)

Configurez la suppression en cascade au niveau de la base de données dans votre `DbContext`:

```csharp
protected override void OnModelCreating(ModelBuilder builder)
{
    base.OnModelCreating(builder);

    // Configuration pour supprimer automatiquement les relations user-role
    builder.Entity<IdentityUserRole<string>>()
        .HasKey(ur => new { ur.UserId, ur.RoleId });

    // Optionnel: Cascade delete
    builder.Entity<IdentityRole>()
        .HasMany<IdentityUserRole<string>>()
        .WithOne()
        .HasForeignKey(ur => ur.RoleId)
        .IsRequired()
        .OnDelete(DeleteBehavior.Cascade);
}
```

## Avantages de la Solution Backend

1. **Atomicité**: Toute l'opération réussit ou échoue ensemble
2. **Performance**: Une seule transaction au lieu de N+1 requêtes HTTP
3. **Sécurité**: La logique métier est centralisée côté serveur
4. **Cohérence**: Garantit que la base de données reste dans un état cohérent
5. **Logs**: Meilleure traçabilité des opérations

## Migration

Une fois le backend corrigé:

1. Déployez la nouvelle version du backend
2. Le frontend continuera de fonctionner (la logique actuelle restera compatible)
3. Optionnellement, vous pouvez simplifier le frontend en retirant la logique de suppression manuelle des rôles

## Tests Recommandés

Après avoir implémenté la correction:

1. Créer un rôle de test
2. Assigner ce rôle à plusieurs utilisateurs
3. Supprimer le rôle
4. Vérifier que:
   - Le rôle est bien supprimé
   - Tous les utilisateurs n'ont plus ce rôle
   - La base de données est cohérente
   - Les logs contiennent les bonnes informations

## Notes Importantes

- Le rôle "Admin" est protégé et ne peut pas être supprimé
- L'opération est journalisée pour traçabilité
- Le nombre d'utilisateurs affectés est retourné dans la réponse
- En cas d'erreur, une transaction garantit qu'aucune modification n'est appliquée
