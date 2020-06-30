# Frontend

## Prerequesites

- NPM >= 5
- Node >= 8

## Installation of dependencies

Run `npm i`

## Development

Run `npm start`

This will start a web server on https://localhost:9000. Accept the untrusted certificate, well, because it's unsigned and for localhost.

### Configuration

We default the backend to go towards `http://api.nbiot.engineering`, but when developing this might not be preferrable as you might have your own horde running.

Ex: To set the backend to `http://localhost:8080` and websocket server to `ws://localhost:9090`

```bash
npm start "webpack.server.hmr --env.hordeEndpoint=http://localhost:8080 --env.hordeWsEndpoint=ws://localhost:9090"
```

#### Configuration overriding

The environment variables who can be configured through the CLI is the following

- myConnectUrl: string
- hordeEndpoint: string
- hordeWsEndpoint: string
- production: boolean

#### Tokens

Tokens and other keys are found under `config/config.json`. The credentials are restricted so change these if you plan to deploy your own Horde.

## Test

Run all tests

```bash
npm start test.all
```

Running this command will run all the tests below

### Unit/Jest

```bash
npm start test.jest
```

This will run tests found in the project and create a coverage report in `test/coverage-jest` which can be opened locally in your favorite browser.

#### Jest Dev

When developing it is easier to have Jest enabled to watch for changes. You can run

```bash
npm start test.jest.watch
```

Which will start Jest in watch mode and let you see the results of the running tests near instantaneous.

### Built app

#### Bundlesize

```bash
npm start build # This builds a production build to be tested
npm start test.build
```

NOTE: This will only test the prebuilt app, ie whatever lies in `./dist`.

### Linting

```bash
npm start lint
```

Will run all linting below

#### Linting of JavaScript

```bash
npm start lint.eslint
```

#### Linting of TypeScript

```bash
npm start lint.tslint
```

#### Linting of SCSS

```bash
npm start lint.stylelint
```

### Testing deps for vulnerabilities

```bash
npm start test.dependencies
```

## Build

Run `npm start build`

This will build an optimized build for production purposes and output to the `dist` folder.

## Deployment

To deploy run

```bash
npm start deploy
```

This will trigger a full test of the project along with the corresponding deploy script. You'll need the correct credentials to be able to use the scripts. The scripts uploads to an AWS S3-bucket and refreshes the AWS CloudFront distribution upon successful upload.
