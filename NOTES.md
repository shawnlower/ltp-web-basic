Notes on designing a very minimal web application.

- We'll be using [Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox) for our implementation

# Setup

```bash
$ npm i @angular/cli
$ ng new ltp-app --routing --directory app
$ cd app; npm audit
```


# Design notes

## Modals

We want a modal for creating a new item and editing existing.

This is really just the default app..let? for the page. It could hypothetically
be used to provide a view/control for any application


Reqs:
1) Take arbitrary text
2) Accept a url
3) Set the type
4) Alter the view based on type

Workflow:
- init (via hotkey / button)
- text box appears, input focused

|----------------------------------------------------------------------------|
| (T)ype: text snippet <http://schema.org/Note>                              |
|----------------------------------------------------------------------------|
|  Text (i)nput: [                                                         ] |
|                [                                                         ] |
|                [ Buy laundry detergent                                   ] |
|----------------------------------------------------------------------------|
| 1) To-do item                                                              |
| 2) Note                                                                    |
|----------------------------------------------------------------------------|
| (L)inks:                                                                   |
|----------------------------------------------------------------------------|

- user enters some text
- Suggest content types
- User optionally selects a more specific type using hotkey (e.g. M-a)
    - Additional fields appear (most-common fields, with [..more..] for all
    - When no input field has focus, '/' allows searching through fields, or
      activating the 'link' action ('l'). When field IS focused, the same
      hotkey apply, pre-fixed with M- (alt)
- User presses <enter> to submit form
- Item created
- Item added to activity
- Item selected within activity, for next action (e.g.: 'l' to link, 'e' to
  re-open editor modal, '!' to execute shell command, etc)
