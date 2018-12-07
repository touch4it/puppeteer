# Puppeteer wrapper

Wrapper around [Puppeteer](https://pptr.dev/) library to make it easier to use.

Puppeteer is a Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol. Puppeteer runs headless by default, but can be configured to run full (non-headless) Chrome or Chromium.

## Installing

Install puppeteer wrapper from npm

```bash
npm i @touch4it/puppeteer
```

In order to use it you will need to require it first

```javascript
const puppeteerT4IT = require('@touch4it/puppeteer');
```

## Documentation

### Change default TIMEOUT and SCREENSHOT_DIRECTORY vars

If you want to use diffrent timeout and screenshot directory, you can use init function to change these variables. You can pass following arguments into this function:
*   `timeout` Default request timeout which will be use in the module (defaults to `30000` ms)
*   `screenshotDirectory` Name of the directory where screenshots will be stored (defaults to `screenshots/`)

```javascript
puppeteerT4IT.init(5000, 'some_other_dir/');
```

### Launch new browser instance

You can pass `option` object as argument, which can contain all available option for [launch()](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-puppeteerlaunchoptions) function

Returns new [Browser](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-class-browser) instance.

```javascript
let browser = await puppeteerT4IT.launch({ headless: false });
```

### Get new page instance

You can pass following arguments into this function:
*   `browser` A [Browser](#Launch-new-browser-instance) instance that you have created with [puppeteer.launch()](#Launch-new-browser-instance)
*   `authenticationData` Object containing "username" and "password" [authentication](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-pageauthenticatecredentials) keys for basic auth when the page is launched

Returns new [Page](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-class-page) instance.

```javascript
let page = await puppeteerT4IT.getPage(browser, { username: 'User', password: '123abc' });
```

### Navigate to web page and test status code

You can pass following arguments into this function:
*   `page` Puppeteer [page](#Get-new-page-instance) object
*   `url` URL to be redirected to
*   `statusCode` awaited HTTP response status code (defaults to `200`)

Returns `page`

```javascript
await puppeteerT4IT.goto(page, baseUrl);
```

### Timeout execution for specified amount of milliseconds

You can pass following arguments into this function:
*   `ms` time in ms to wait

Returns empty Promise

```javascript
await puppeteerT4IT.sleep(500);
```

### Make screenshots from web page

You can pass following arguments into this function:
*   `page` Puppeteer [page](#Get-new-page-instance) object
*   `width` Screen width
*   `height` Screen height
*   `pageName` Web page name under which a screenshot will be stored
*   `deviceScaleFactor` Specify device scale factor (Defaults to `1`)
*   `isMobile` isMobile Whether the meta viewport tag is taken into account (defaults to `false`)
*   `delay` Time in ms to wait after reload (defaults to `0`)
*   `beforeAction` Function to be called before screenshot is made (defaults to `null`)
*   `beforeActionParameters` beforeAction parameters (defaults to `[]`)

Returns empty Promise

```javascript
await puppeteerT4IT.screenshotPage(page, 360, 640, 'frontpage', 1, true, delay, clickOnButton, ['.navigation-element--class']);
```

### Make screenshots in most popular screen resolutions

You can pass following arguments into this function:
*   `page` Puppeteer [page](#Get-new-page-instance) object
*   `name` Web page name under which screenshots will be stored
*   `delay` Time in ms to wait after reload (defaults to `0`)
*   `beforeAction` Function to be called before screenshot is made (defaults to `null`)
*   `beforeActionParameters` beforeAction parameters (defaults to `[]`)

Returns empty Promise

```javascript
await puppeteerT4IT.screenshotMultipleResolutions(page, 'projects', 4000);
```

### Click on element

You can pass following arguments into this function:
*   `page` Puppeteer [page](#Get-new-page-instance) object
*   `querySelector` Page element selector
*   `delay` Time in ms to wait after reload (defaults to `0`)

Returns empty Promise

```javascript
await puppeteerT4IT.click(page, '.class', 500);
```

### Tap on element

You can pass following arguments into this function:
*   `page` Puppeteer [page](#Get-new-page-instance) object
*   `querySelector` Page element selector
*   `delay` Time in ms to wait after reload (defaults to `0`)

Returns empty Promise

```javascript
await puppeteerT4IT.tapOnElement(page, '.class', 500);
```

### Get href link from element

You can pass following arguments into this function:
*   `page` Puppeteer [page](#Get-new-page-instance) object
*   `querySelector` Page element selector

Returns link href from element

```javascript
await puppeteerT4IT.getLinkByQuerySelector(page, '.class');
```

### Get href link hostname from element

You can pass following arguments into this function:
*   `page` Puppeteer [page](#Get-new-page-instance) object
*   `querySelector` Page element selector

It returns link hostname from element.

```javascript
await puppeteerT4IT.getHostnameByQuerySelector(page, '.class');
```

### Get value from element

You can pass following arguments into this function:
*   `page` Puppeteer [page](#Get-new-page-instance) object
*   `querySelector` Page element selector

Returns value of element

```javascript
await puppeteerT4IT.getValueByQuerySelector(page, '.class');
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Changelog

Project updates are tracked in a [CHANGELOG](CHANGELOG.md) file
