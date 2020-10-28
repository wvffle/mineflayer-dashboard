# API

## Classes

### Mode

`Mode` peut être accédé depuis `bot.dashboard.Mode`

#### Constructor

> `new bot.dashboard.Mode(name, options)`

- `name` `String`
- `options`
  - `interpreter` `Function` interpréteur custom qui interprète les entrées de l'utilisateur
  - `completer` `Function` Compléteur custom qui retourne une liste de complétions (doit être une liste de Strings)
  - `fg` `String` Default: `white` couleur du texte de blessed
  - `bg` `String` Default: `green` couleur de l'arrière plan de blessed

#### Mode.name

- `String` `readonly`

#### Mode.window

- [`Box`](https://github.com/chjj/blessed#box-from-element) `readonly`

#### Mode.decoratedName

- `String` `readonly`

#### Mode.history

- [`History`](#History) `readonly`

#### Mode.println()

Affiche la ligne dans la fenêtre du mode
> `Mode.println(...args)`
- `...lines` `...String` Ligne(s) à afficher

#### Mode.resetCompletion()

**Used internally**

#### Mode.interpret()

**Used internally**
`Async`
> `Mode.interpret(string)`
- `string` `string` String à interpréter

#### Mode.complete()

**Used internally**
`Async`
> `Mode.complete(string, ?direction)`
- `string` `string` String à completer
- `direction` `number` Par défaut: `1` Pour retourner la prochainne ou la précédente complétion (1 = suivant; -1 = précédant)

### History

**Internal class**

#### History.push()

Ajouter une String à l'historique
> `History.push(string)`
- `string` `String`

Returns: `Number` taille de l'historique

#### History.start()

Réinitialise la position de l'historique au début

Returns: [`History`](#History)

#### History.get()

Récupérer l'élément actuel de l'historique, retourne `undefined` si il n'y a pas d'élément

Returns: `String|undefined`

#### History.next()

Décendre dans l'historique
> `History.next(?n)`
- `n` `Number` Par défaut: `1` Nombre d'étapes à décendre

Returns: `String`

#### History.prev()

Remonter l'historique
> `History.prev(?n)`
- `n` `Number` Default: `1` Nombre d'étapes à remonter

Returns: `String`

## bot.dashboard

mineflayer-dashboard ajoute sa propre variable à `bot`

### bot.dashboard.log()

Affiche la ligne dans la fenêtre de log
> `bot.dashboard.log(...args)`
- `...args` `...String` Ligne(s) à afficher

### bot.dashboard.commands

Map de toutes les commandes
```
{
  commandName: callback,
  ...
}
```

- `commandName` `String`
- `callback` `Function` appelé quand la commande est éxécutée