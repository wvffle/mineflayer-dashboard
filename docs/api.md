# API

## Classes

### Mode

`Mode` can be accessed with `bot.dashboard.Mode`

#### Constructor

`new bot.dashboard.Mode(name, options)`

- `name` `String`
- `options`
  - `interpreter` `Function` custom interpreter that interprets user input
  - `completer` `Function` custom completer that returns an array of completions (must be Strings)
  - `fg` `String` Default: `white` blessed color of the text
  - `bg` `String` Default: `green` blessed color of the background

#### Mode.name

- `String` `readonly`

#### Mode.window

- [`Box`](https://github.com/chjj/blessed#box-from-element) `readonly`

#### Mode.decoratedName

- `String` `readonly`

#### Mode.history

- [`History`](#History) `readonly`

#### Mode.println()

- `...lines` `...String` Print line in mode window

#### Mode.resetCompletion()

**Used internally**

#### Mode.interpret()

**Used internally**
`Async`
- `string` `string` String to interpret

#### Mode.complete()

**Used internally**
`Async`
- `string` `string` String to complete
- `direction` `number` Default: `1` To return the next or the previous completion (1 = next; -1 previous)

### History

**Internal class**
