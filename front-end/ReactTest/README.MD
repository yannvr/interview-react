# Alphakinetic React Test

The exercise is to create an autocomplete country dropdown box within this Javascript and create-react-app skeleton.

The solution should use the latest React version

## Spec

As you start typing a country name it should present you some "best matching" country names in a dropdown. Choose a simple way of matching what you typed to a few countries for now.

Clicking a country in the dropdown list should add/update a line in the DOM *"Your chosen country is __ABC__"*

## Hints

The client is just *create-react-app* with prettier plugin added to eslint.

Create React App docs: https://facebook.github.io/create-react-app/docs/getting-started

Target browser is latest chrome so don't worry about polyfills or anything.

Ignore styling initially and try to get something working first.

Think about functionality, UX and code layout (to a degree) too.

## Country list API

URL: `/api/countries` (ie have added a proxy so you can omit hostname in url)

Returns an array of form: `[{name: "United Kingdom", code: "UK" }]`


## Starting

client in one terminal : `cd client; yarn start`

server in another terminal : `node server.js`

Client is http://localhost:3000

Server is http://localhost:5000 but as have setup proxy just GET REST url without host eg "/api/blah"

## Possible enhancements 

Implement any one of these if you have time.

We'll also talk about how you might implement some of these in relation to your code after the test.

- Add nice styling (css, css modules or css-in-js)
- Can you improve the UX as the spec is quite vague.  A few examples, but do suggest others:
  - using arrow keys + enter key
  - what happens to input box when you have chosen a country
- Add a jest test(s), possibly with enzyme or react-testing-library
- Add Error handling
- Add a storybook/cypress/react-cosmos etc test(s)
