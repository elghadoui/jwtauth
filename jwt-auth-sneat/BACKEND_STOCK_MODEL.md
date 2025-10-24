# Modèle Backend pour tbl_stock

## Structure de la Table

```sql
CREATE TABLE tbl_stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    refver INT NULL,
    refverreel INT NULL,
    nomprod VARCHAR(255) NULL,
    nomver VARCHAR(255) NULL,
    poidini DOUBLE NULL,
    pdjr DOUBLE NULL,
    cumultg DOUBLE NULL,
    conditionnement DOUBLE NULL,
    stockstat DOUBLE NULL,
    estimat DOUBLE NULL,
    soldverge DOUBLE NULL,
    codvar INT NULL,
    nomvar VARCHAR(100) NULL,
    user VARCHAR(50) NULL,
    station VARCHAR(100) DEFAULT 'COOPERATIVE ZAOUIA',
    activ VARCHAR(150) DEFAULT 'Station de Conditionnement',
    camp VARCHAR(150) DEFAULT '24-25',
    dteupdate DATETIME NULL
);
```

## Modèle C# (.NET)

```csharp
// Models/Stock.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JwtAuth.Models
{
    [Table("tbl_stock")]
    public class Stock
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("refver")]
        public int? Refver { get; set; }

        [Column("refverreel")]
        public int? Refverreel { get; set; }

        [Column("nomprod")]
        [StringLength(255)]
        public string Nomprod { get; set; }

        [Column("nomver")]
        [StringLength(255)]
        public string Nomver { get; set; }

        [Column("poidini")]
        public double? Poidini { get; set; }

        [Column("pdjr")]
        public double? Pdjr { get; set; }

        [Column("cumultg")]
        public double? Cumultg { get; set; }

        [Column("conditionnement")]
        public double? Conditionnement { get; set; }

        [Column("stockstat")]
        public double? Stockstat { get; set; }

        [Column("estimat")]
        public double? Estimat { get; set; }

        [Column("soldverge")]
        public double? Soldverge { get; set; }

        [Column("codvar")]
        public int? Codvar { get; set; }

        [Column("nomvar")]
        [StringLength(100)]
        public string Nomvar { get; set; }

        [Column("user")]
        [StringLength(50)]
        public string User { get; set; }

        [Column("station")]
        [StringLength(100)]
        public string Station { get; set; } = "COOPERATIVE ZAOUIA";

        [Column("activ")]
        [StringLength(150)]
        public string Activ { get; set; } = "Station de Conditionnement";

        [Column("camp")]
        [StringLength(150)]
        public string Camp { get; set; } = "24-25";

        [Column("dteupdate")]
        public DateTime? Dteupdate { get; set; }
    }
}
```

## DTOs

```csharp
public class StockCreateDto
{
    public int? Refver { get; set; }
    public int? Refverreel { get; set; }
    public string Nomprod { get; set; }
    public string Nomver { get; set; }
    public double? Poidini { get; set; }
    public double? Pdjr { get; set; }
    public double? Cumultg { get; set; }
    public double? Conditionnement { get; set; }
    public double? Stockstat { get; set; }
    public double? Estimat { get; set; }
    public double? Soldverge { get; set; }
    public int? Codvar { get; set; }
    public string Nomvar { get; set; }
    public string User { get; set; }
    public string Station { get; set; }
    public string Activ { get; set; }
    public string Camp { get; set; }
}

public class StockUpdateDto
{
    public int? Refver { get; set; }
    public int? Refverreel { get; set; }
    public string Nomprod { get; set; }
    public string Nomver { get; set; }
    public double? Poidini { get; set; }
    public double? Pdjr { get; set; }
    public double? Cumultg { get; set; }
    public double? Conditionnement { get; set; }
    public double? Stockstat { get; set; }
    public double? Estimat { get; set; }
    public double? Soldverge { get; set; }
    public int? Codvar { get; set; }
    public string Nomvar { get; set; }
    public string User { get; set; }
    public string Station { get; set; }
    public string Activ { get; set; }
    public string Camp { get; set; }
}

// Format attendu de l'API externe
public class ExternalStockData
{
    public int? refver { get; set; }
    public int? refverreel { get; set; }
    public string nomprod { get; set; }
    public string nomver { get; set; }
    public double? poidini { get; set; }
    public double? pdjr { get; set; }
    public double? cumultg { get; set; }
    public double? conditionnement { get; set; }
    public double? stockstat { get; set; }
    public double? estimat { get; set; }
    public double? soldverge { get; set; }
    public int? codvar { get; set; }
    public string nomvar { get; set; }
    public string user { get; set; }
    public string station { get; set; }
    public string activ { get; set; }
    public string camp { get; set; }
}
```

## Légende des Colonnes

| Colonne | Signification | Type |
|---------|--------------|------|
| `refver` | Référence du verger | int |
| `refverreel` | Référence réelle du verger | int |
| `nomprod` | Nom du producteur | varchar(255) |
| `nomver` | Nom du verger | varchar(255) |
| `poidini` | Poids initial (en kg) | double |
| `pdjr` | Poids journalier (en kg) | double |
| `cumultg` | Cumul total reçu / Total réception (en kg) | double |
| `conditionnement` | Quantité conditionnée (en kg) | double |
| `stockstat` | Stock station / Sold Station (en kg) | double |
| `estimat` | Estimation verger (en kg) | double |
| `soldverge` | Solde du verger / Sold Verger (en kg) | double |
| `codvar` | Code variété | int |
| `nomvar` | Nom variété (ex: CLEMENTINE) | varchar(100) |
| `user` | Utilisateur | varchar(50) |
| `station` | Station (défaut: COOPERATIVE ZAOUIA) | varchar(100) |
| `activ` | Activité (défaut: Station de Conditionnement) | varchar(150) |
| `camp` | Campagne (défaut: 24-25) | varchar(150) |
| `dteupdate` | Date et heure de mise à jour | datetime |

## Notes d'Implémentation

1. **Pas de clé primaire auto-increment** : Ajouter `id` comme PK
2. **Valeurs par défaut** : Station, Activ, Camp ont des valeurs par défaut
3. **Nullable** : Tous les champs sont NULL sauf les valeurs par défaut
4. **DateTime** : `dteupdate` sera automatiquement mis à jour lors des modifications
