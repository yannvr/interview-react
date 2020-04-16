# Frontend/React Interview Questions

## Telephone questions

- Can you describe the favourite thing you have worked on technically?

- Can you mention some newer JS language features that you used and why they were helpful?

*Candidate might mention newer JS language features (aka es6, es7+ features) like arrow functions. Get them to explain why they help make code more readable, faster or any benefit / trade off.*

- Can you talk a little about the last tests you wrote. What other types of testing and tools do you use?

*Unit tests vs integration tests vs end to end tests. Pros and cons to each layer of testing such type of bugs caught, speed to write tests, how maintainable or brittle they are, how readable the tests are*

- Any upcoming technology/technique you want to use and why?

*Ask what problem does it solve and what are the trade offs*

- What is a controlled component and why are they useful?

*See https://reactjs.org/docs/forms.html#controlled-components, State within wrapper React component so can validate state upon events from child. The controlled component just renders what it's told ie only deals with styling and passing events to parent. Useful so state is controlled in one place: "Single source of truth"*


## Job Spiel

- Mention Glide OMS
- Talk about growing CLO market and Virtus acquisition
- Talk about technology/apps we have : WPF Client, C# & Python Server, Angular Web App, React Native Mobile App
- Mention highly configurable config system (more like a temporal key-value store) backed by Postgres


## Interview Questions

- What do they want to do
- Why are they moving
- Ask about Finance experience
- Ask to explain good/bad points of specific technology they used on their CV
- Inheritance vs composition?
- If you could improve/introduce one technical thing at you last (or other) roles, what would that be?

- How do you take a design and implement it? what tools have you found useful?

*More of a process question, eg who splits up component (designer, dev, consesus discussion), any useful tools they've used like Zeplin. Pros / cons of their method. How to deal with responsive design? What about changing requirements and modifying their chosen abstraction/component split (ie tests help refactor).*

- Ask if comfortable in c# / python as will be a bonus

- functional programming vs OO *(if you think they are up to it)*

- Why typescript useful?

*Static typing IMO helps prevent bugs, helps refactoring, better IDE autocomplete. Can force good code/interface design much like TDD does*

- How do you manage async control flow? 

*__Thunks__ (simple and easy to understand but no control flow) vs __sagas__ (using generators/yield can have complex async flows vs __rxjs__ (treating things as streams makes concepts like debouncing and filtering easy to code and read)*

- How do you manage state in the UI? (Redux vs local state vs hooks maybe)

*__Redux__ or __Mobx__ : global state shared amongst disparate components in component tree. Saves passing properties down many layers of components (brittle, verbose and hard to maintain). vs __local state in component__ : makes component (and children) more resuable as dont need a central store. State closer to UI code can be easier to read and quicker to write. vs __hooks__: new React fearure (as yet unreleased). Allows you to write reusable side effects/state for functional components. Reduces need for redux and nice to reuse hook code in different components. Hooks often easier to read and maintain as code not split across component class lifecycle methods (mount/unmount).*

- Can you talk about two way binding (angular 1) vs one way binding? Pros/Cons
*One way binding simpler mental model. Two way can lead to a spiral of re-renders (in an hard to diagnose order) as updating one component affects others which in turn affects others.*


## Possible quick paper coding questions

- Create Fibonacci
- Function to determine max number in array

## Overview of our Frontend Stack

- React : Leading frontend library (good to hire engineers who can hit the ground running). Component paradigm leads to nice UI building blocks which are simpler to write and test. Active development of new cutting edge features like hooks, suspense and lazy loading components.

- Typescript: Static typing IMO helps prevent bugs, helps refactoring, better IDE autocomplete. Can force good code/interface design much like TDD does

- React Native: Less mental effort to switch between web and mobile code. In monorepo possible to re-use code and even same libraries.
 
- Styled Components: CSS-in-JS is easier to read and write than cross referencing css classnames when reading the JSX IMHO.

- Jest: leading unit test library, tests run in parallel, powerful and easy to use mocking capabilities

- React Testing Library: As oppose to enzyme the philopshy here is to not shallow render components to make testing a component more *intergration-y*, ie run more real code

- Cypress: easy to use end to end testing library with screenshots and videos. Possible pixel diffing in future too. Lovely API (eg jquery like selectors, will auto retry to get elements so more robust, hides lots of promise logic from you). Allows you to stub network requests to speed up some tests, or stub network requests to force certain responses from server (eg error states), peform network requests before tests to speed up tests (eg so you're logged in)

- Monorepo with Yarn Workspaces + Lerna : Reuse code and components across web apps and mobile. Share build tools. Upgrade dependencies in one spot. Easier to make changes and code review features that span projects, ie one PR. 

- Storybook: live style guide nicer to check consistency with the design across all builds. Build components independently of page. Nice to onboard new developers so they can see all components, how they are used and in what states. Possible future pixel diffing.

- Saga : Powerful async control flow possible. 

- Prettier + TSLint : quicker development as autoformats consistently on save. Catches bugs from lint errors/warnings

## Requirements for React frontend test

- VSCode / Atom
- Prettier plugin
- Eslint plugin
