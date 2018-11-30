# PuppeteerT4IT-wrapper

Wrapper around Puppeteer library to make it easier to use.

### Prerequisites

In order to use this package you will need to install puppeteer first

```
npm i puppeteer
```

Note that you should have some knowledge of [Puppeteer](https://pptr.dev/) in order to use this tool.

### Installing

Install puppeteer wrapper from npm

```
npm i puppeteer_t4it_wrapper
```

In order to use it you will need to require it first

```
const puppeteerT4IT = require('puppeteer_t4it_wrapper');
```
## Documentation

##### Change default TIMEOUT and SCREENSHOT_DIRECTORY vars.
If you want to use diffrent timeout and screenshot directory, you can use init function to change this variables. You can pass following arguments into this function:
* `` timeout `` a tmieout which will be use in the module
* `` screenshot_directory `` name of the directory where screenshots will be stored

```
puppeteerT4IT.init(5000, 'some_other_dir/');
```

##### Launch new browser instance.
You can pass `` option `` object as argument, which can contain all available option for [puppeteer.launch()](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-puppeteerlaunchoptions) funciton. It returns new `` browser `` instance.

```
let browser = await puppeteerT4IT.launch({ headless: false});
```

##### Get new page instance.
You can pass following arguments into this function:
* `` browser `` a browser instance which you have created with puppeteerT4IT.launch()
* `` authenticationData `` object containing "username" and "password" keys for basic auth when the page is launched. 

It returns new `` page `` instance.

```
let page = await puppeteerT4IT.getPage(browser, {username: 'User', password: '123abc'});
```

##### Navigate to web page and test status code.
You can pass following arguments into this function:
* `` page `` puppeteer page object
* `` url `` URL to be redirected to (string)
* `` statusCode `` awaited HTTP response status code (number)

It returns same browser `` page `` as was passed in.

```
await puppeteerT4IT.goto(page, baseUrl);
```

##### Timeout execution for specified amount of milliseconds.
You can pass following arguments into this function:
* `` ms `` time in ms to wait (number)

It returns empty promise.

```
await puppeteerT4IT.sleep(500);
```

##### Make screenshots from web page.
You can pass following arguments into this function:
* `` page `` puppeteer page object 
* `` width `` screen width (number)
* `` height `` screen height (number)
* `` pageName `` web page name under which screenshot will be stored (string)
* `` deviceScaleFactor `` Specify device scale factor (can be thought of as dpr). Defaults to 1 (number)
* `` isMobile `` isMobile Whether the meta viewport tag is taken into account. Defaults to false (boolean)
* `` delay `` Time in ms to wait after reload (number)
* `` beforeAction `` Function to be called before screenshot is made (function)
* `` beforeActionParameters `` beforeAction parameters (array)

It returns empty promise.

```
await puppeteerT4IT.screenshotTest(page, 360, 640, name, 1, true, delay, beforeAction, beforeActionParameters);
```

##### Make screenshots in most popular screen resolutions
You can pass following arguments into this function:
* `` page `` puppeteer page object 
* `` name `` web page name under which screenshot will be stored (string)
* `` delay `` Time in ms to wait after reload (number)
* `` beforeAction `` Function to be called before screenshot is made (function)
* `` beforeActionParameters `` beforeAction parameters (array)

It returns empty promise.

```
 await puppeteerT4IT.screenshotMultipleResolutions(page, 'projects', 4000);
```

##### Click on element
You can pass following arguments into this function:
* `` page `` puppeteer page object 
* `` querySelector `` page element selector (string)
* `` delay `` Time in ms to wait after reload (number)

It returns empty promise.

```
await puppeteerT4IT.click(page, '.class', 500);
```

##### Tap on element
You can pass following arguments into this function:
* `` page `` puppeteer page object 
* `` querySelector `` page element selector (string)
* `` delay `` Time in ms to wait after reload (number)

It returns empty promise.

```
await puppeteerT4IT.tapOnElement(page, '.class', 500);
```

##### Get href link from <a> element
You can pass following arguments into this function:
* `` page `` puppeteer page object 
* `` querySelector `` page element selector (string)

It returns link href from element.

```
await puppeteerT4IT.getLinkByQuerySelector(page, '.class');
```

##### Get href link hostname from <a> element
You can pass following arguments into this function:
* `` page `` puppeteer page object 
* `` querySelector `` page element selector (string)

It returns link hostname from element.

```
await puppeteerT4IT.getHostnameByQuerySelector(page, '.class');
```

##### Get href link hostname from <a> element
You can pass following arguments into this function:
* `` page `` puppeteer page object 
* `` querySelector `` page element selector (string)

It returns value of element.

```
await puppeteerT4IT.getValueByQuerySelector(page, '.class');
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
