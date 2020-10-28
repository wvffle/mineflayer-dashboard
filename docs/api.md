# API

## Classes

### Mode

`Mode` can be accessed with `bot.dashboard.Mode`

#### Constructor

> `new bot.dashboard.Mode(name, options)`

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

Print line in mode window
> `Mode.println(...args)`
- `...lines` `...String` Line(s) to print

#### Mode.resetCompletion()

**Used internally**

#### Mode.interpret()

**Used internally**
`Async`
> `Mode.interpret(string)`
- `string` `string` String to interpret

#### Mode.complete()

**Used internally**
`Async`
> `Mode.complete(string, ?direction)`
- `string` `string` String to complete
- `direction` `number` Default: `1` To return the next or the previous completion (1 = next; -1 previous)

### History

**Internal class**

#### History.push()

Push string to the history
> `History.push(string)`
- `string` `String`

Returns: `Number` size of history

#### History.start()

Reset history position to the start

Returns: [`History`](#History)

#### History.get()

Get current history element, returns `undefined` if there is no element

Returns: `String|undefined`

#### History.next()

Go down the history
> `History.next(?n)`
- `n` `Number` Default: `1` How many steps to go down

Returns: `String`

#### History.prev()

Go up the history
> `History.prev(?n)`
- `n` `Number` Default: `1` How many steps to go up

Returns: `String`

## bot.dashboard

mineflayer-dashboard add his own property to `bot`

### bot.dashboard.log()

Print line into log window
> `bot.dashboard.log(...args)`
- `...args` `...String` Line(s) to print

### bot.dashboard.commands

Map of all commands
```
{
  commandName: callback,
  ...
}
```

- `commandName` `String`
- `callback` `Function` called when command is executed