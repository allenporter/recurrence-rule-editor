# \<recurrence-rule-editor>

A webcomponent for editing rfc5545 recurrence rules. This webcomponent follows the
[open-wc](https://github.com/open-wc/open-wc) recommendation. 

See [demo](https://allenporter.github.io/recurrence-rule-editor/) for an example.

## Installation

```bash
npm i @allenporter/recurrence-rule-editor
```

## Usage

```html
<script type="module">
  import '@allenporter/recurrence-rule-editor/recurrence-rule-editor.js';
</script>

<recurrence-rule-editor></recurrence-rule-editor>
```

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

## Testing with Web Test Runner

To execute a single test run:

```bash
npm run test
```

To run the tests in interactive watch mode run:

```bash
npm run test:watch
```

Tests use [chrome-launcher](https://github.com/GoogleChrome/chrome-launcher) which may need chrome downloaded locally. See the [download-chrome.sh](https://github.com/GoogleChrome/chrome-launcher/blob/main/scripts/download-chrome.sh) script then configure chrome environment variable before running tests.

```bash
export CHROME_PATH=/home/${USER}/recurrence-rule-editor/chrome-linux/chrome
npm test
```


## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
