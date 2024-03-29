const assert = require('node:assert');
const index = require('puppeteer');
const fs = require('fs-extra');

module.exports = {
  STATUS_OK: 200,
  STATUS_CREATED: 201,
  STATUS_BAD_REQUEST: 400,
  STATUS_UNAUTHORIZED: 401,
  STATUS_FORBIDDEN: 403,
  STATUS_NOT_FOUND: 404,
  STATUS_SERVER_ERROR: 500,

  TIMEOUT: 30_000,
  SCREENSHOT_DIRECTORY: 'screenshots/',

  /**
   * Initialize puppeteer wrapper
   *
   * @param {number} timeout Request timeout in ms
   * @param {string} screenshotDirectory Path of the directory where screenshots will be stored
   * @returns {void} Does not return any data
   */
  init(timeout = 30_000, screenshotDirectory = 'screenshots/') {
    module.exports.TIMEOUT = timeout;
    module.exports.SCREENSHOT_DIRECTORY = screenshotDirectory;
  },

  /**
   * Launch new browser instance
   *
   * @param {Object} options Browser launch options
   * @returns {Promise<Puppeteer.Browser>} Browser instance
   *
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-puppeteerlaunchoptions
   */
  async launch(options = {}) {
    if (typeof options !== 'object' || options === null) {
      options = {};
    }

    if (!Array.isArray(options.args)) {
      options.args = [];
    }

    options.args.push('--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage');

    const browser = await index.launch(options);

    // Browser error handling
    browser.on('disconnected', () => {
      console.log('Chromium has been closed');
    });

    return browser;
  },

  /**
   * Get Puppeteer object
   *
   * @returns {Puppeteer} Puppeteer required library
   */
  getPuppeteer: () => index,

  /**
   * Get new page instance
   *
   * @param {Puppeteer.Browser} browser Browser instance
   * @param {Object?} authenticationData Object containing "username" and "password" keys for basic auth
   * @returns {Promise<Puppeteer.Page>} New page instance
   *
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-browsernewpage
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-pageauthenticatecredentials
   */
  async getPage(browser, authenticationData = null) {
    const page = await browser.newPage();

    // Failed request handling
    page.on('requestfailed', request => {
      if (request.failure().errorText !== 'net::ERR_ABORTED') {
        console.error(`Request failed: ${request.url()} ${request.failure().errorText}`);
      }
    });

    // Page error handling
    page.on('error', error => {
      console.error('page on error', error);
    });

    if (authenticationData) {
      await page.authenticate(authenticationData);
    }

    // Content
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    return page;
  },

  /**
   * Navigate to web page and test status code
   *
   * @param {Puppeteer.Page} page Browser page object
   * @param {string} url URL to be redirected to
   * @param {number} expectedStatusCode awaited HTTP response status code
   * @returns {Promise<Puppeteer.Page>} Browser page
   *
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-pagegotourl-options
   * @see https://www.npmjs.com/package/assert#assertequalactual-expected-message
   */
  async goto(page, url, expectedStatusCode = 200) {
    console.log(`Goto ${url}`);

    const response = await page.goto(url, {
      timeout: module.exports.TIMEOUT,
      waitUntil: 'domcontentloaded',
    });

    const receivedStatusCode = response.status();

    if (!response) {
      throw new Error(`Response empty for "${url}"`);
    }

    assert.equal(`${receivedStatusCode}`, `${expectedStatusCode}`, `Wrong status code for "${url}"`);

    return page;
  },

  /**
   * Timeout execution for specified amount of milliseconds
   *
   * @param {int} ms - Time in ms
   * @returns {Promise<void>} Resolved promise when finished
   */
  // eslint-disable-next-line no-promise-executor-return
  sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Make screenshots from web page
   *
   * @param {Puppeteer.Page} page Puppeteer page object
   * @param {int} width Screen width
   * @param {int} height Screen height
   * @param {string} pageName Web page name
   * @param {number} deviceScaleFactor Specify device scale factor (can be thought of as dpr). Defaults to 1
   * @param {boolean} isMobile Whether the meta viewport tag is taken into account. Defaults to false
   * @param {number} delay Time in ms to wait after reload
   * @param {function} beforeAction Function to be called before screenshot is made
   * @param {array} beforeActionParameters beforeAction parameters
   * @returns {Promise<void>} Resolved promise when finished
   *
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-pagesetviewportviewport
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-pagereloadoptions
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-pagescreenshotoptions
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-pageselector
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-elementhandledispose
   */
  async screenshotPage(page, width, height, pageName, deviceScaleFactor = 1, isMobile = false, delay = 0, beforeAction = null, beforeActionParameters = []) {
    try {
      const pathName = `${pageName}-${(`${width}`).padStart(4, '0')}x${(`${height}`).padStart(4, '0')}at${deviceScaleFactor}`;

      console.log(`Screenshotting ’${pathName}’`);

      deviceScaleFactor = Number.parseInt(deviceScaleFactor, 10);

      if (Number.isNaN(deviceScaleFactor) || deviceScaleFactor < 1) {
        throw new Error('device scale factor incorrect');
      }

      await page.setViewport({
        width,
        height,
        deviceScaleFactor,
        isMobile,
      });

      try {
        await page.reload({
          timeout: module.exports.TIMEOUT,
          waitUntil: 'domcontentloaded',
        });
      // eslint-disable-next-line unicorn/prefer-optional-catch-binding
      } catch (_) {
        console.log(`Failed reload: ${pathName}`);
        return;
      }

      // Wait before making screenshot
      if (Number(delay) > 0) {
        await module.exports.sleep(delay);
      }

      // Optionally call method before screenshotting
      if (beforeAction) {
        await beforeAction(...beforeActionParameters);
      }

      // Viewport screenshot
      await page.screenshot({
        path: `${module.exports.SCREENSHOT_DIRECTORY + pageName}/${pathName}-viewport.jpg`,
        fullPage: false,
        type: 'jpeg',
      });

      // Full page screenshot
      const bodyHandle = await page.$('body');
      const boundingBox = await bodyHandle.boundingBox();

      let boundingBoxWidth = Number.parseInt(boundingBox.width, 10);
      boundingBoxWidth = (Number.isNaN(boundingBoxWidth)) ? 1 : boundingBoxWidth;
      boundingBoxWidth = (boundingBoxWidth < 1) ? 1 : boundingBoxWidth;

      let boundingBoxHeight = Number.parseInt(boundingBox.height, 10);
      boundingBoxHeight = (Number.isNaN(boundingBoxHeight)) ? 1 : boundingBoxHeight;
      boundingBoxHeight = (boundingBoxHeight < 1) ? 1 : boundingBoxHeight;

      await page.screenshot({
        path: `${module.exports.SCREENSHOT_DIRECTORY + pageName}/${pathName}-fullpage.jpg`,
        clip: {
          x: 0,
          y: 0,
          width: boundingBoxWidth,
          height: boundingBoxHeight,
        },
        type: 'jpeg',
      });

      await bodyHandle.dispose();

      return;
    } catch (error) {
      console.log('screenshotPage', error);
      throw error;
    }
  },

  /**
   * Make screenshots in most popular screen resolutions
   *
   * @param {Puppeteer.Page} page Puppeteer page object
   * @param {string} name Web page name
   * @param {number} delay Time in ms to wait after reload
   * @param {function} beforeAction Function to be called before screenshot is made
   * @param {array} beforeActionParameters beforeAction parameters
   * @returns {Promise<void>} Resolved promise when finished
   *
   * @see https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/ensureDir.md
   */
  async screenshotMultipleResolutions(page, name, delay = 0, beforeAction = null, beforeActionParameters = []) {
    try {
      await fs.ensureDir(module.exports.SCREENSHOT_DIRECTORY + name);

      await module.exports.screenshotPage(page, 360, 640, name, 1, true, delay, beforeAction, beforeActionParameters);
      await module.exports.screenshotPage(page, 360, 640, name, 3, true, delay, beforeAction, beforeActionParameters);
      await module.exports.screenshotPage(page, 640, 360, name, 1, true, delay, beforeAction, beforeActionParameters);
      await module.exports.screenshotPage(page, 1366, 768, name, 1, false, delay, beforeAction, beforeActionParameters);
      await module.exports.screenshotPage(page, 1920, 1080, name, 1, false, delay, beforeAction, beforeActionParameters);
      await module.exports.screenshotPage(page, 375, 667, name, 1, true, delay, beforeAction, beforeActionParameters);
      await module.exports.screenshotPage(page, 375, 667, name, 2, true, delay, beforeAction, beforeActionParameters);
      await module.exports.screenshotPage(page, 667, 375, name, 1, true, delay, beforeAction, beforeActionParameters);
      await module.exports.screenshotPage(page, 1440, 900, name, 1, false, delay, beforeAction, beforeActionParameters);
      await module.exports.screenshotPage(page, 1280, 800, name, 1, false, delay, beforeAction, beforeActionParameters);
    } catch (error) {
      console.log('screenshotMultipleResolutions', error);
      throw error;
    }
  },

  /**
   * Click on element
   *
   * @param {Puppeteer.Page} page Puppeteer page object
   * @param {string} querySelector Page element selector
   * @param {number} delayAfter Time in ms to wait after click
   * @returns {Promise<void>} Resolved promise when finished
   *
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-pageclickselector-options
   */
  async clickOnElement(page, querySelector, delayAfter = 0) {
    try {
      await page.click(querySelector);
    // eslint-disable-next-line unicorn/prefer-optional-catch-binding
    } catch (_) {
      console.log(`Element not found or hidden "${querySelector}"`);
    }

    return module.exports.sleep(delayAfter);
  },

  /**
   * Click on element
   *
   * @param {Puppeteer.Page} page Puppeteer page object
   * @param {string} querySelector Page element selector
   * @param {number} delayAfter Time in ms to wait after click
   * @returns {Promise<void>} Resolved promise when finished
   *
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-pagetapselector
   */
  async tapOnElement(page, querySelector, delayAfter = 0) {
    try {
      await page.tap(querySelector);
    // eslint-disable-next-line unicorn/prefer-optional-catch-binding
    } catch (_) {
      console.log(`Element not found or hidden "${querySelector}"`);
    }

    return module.exports.sleep(delayAfter);
  },

  /**
   * Get href link from <a> element
   *
   * @param {Puppeteer.Page} page Puppeteer page object
   * @param {string} querySelectorString DOM selector of target element
   * @returns {Promise<string?>} Link href from element
   *
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-pageevalselector-pagefunction-args-1
   */
  getLinkByQuerySelector: (page, querySelectorString) => page.$eval(querySelectorString, link => link.href),

  /**
   * Get href link hostname from <a> element
   *
   * @param {Puppeteer.Page} page Puppeteer page object
   * @param {string} querySelectorString DOM selector of target element
   * @returns {Promise<string?>} Link hostname from element
   *
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-pageevalselector-pagefunction-args-1
   */
  getHostnameByQuerySelector: (page, querySelectorString) => page.$eval(querySelectorString, link => link.hostname),

  /**
   * Get value of an element
   *
   * @param {Puppeteer.Page} page Puppeteer page object
   * @param {string} querySelectorString DOM selector of target element
   * @returns {Promise<string?>} Value of element
   *
   * @see https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-pageevalselector-pagefunction-args-1
   */
  getValueByQuerySelector: (page, querySelectorString) => page.$eval(querySelectorString, link => link.innerHTML),
};
