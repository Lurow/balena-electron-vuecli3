'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib'
import fs from 'fs'

var configContent
try {
  fs.statSync('/data/config.json')
  configContent = fs.readFileSync('/data/config.json', 'utf8')
  console.log('Config found')
} catch (err) {
  console.log('Error while reading config.json: ', err)
}

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

// simple parameters initialization
const electronConfig = {
  URL_LAUNCHER_TOUCH: process.env.URL_LAUNCHER_TOUCH === '1' ? 1 : 0,
  URL_LAUNCHER_TOUCH_SIMULATE: process.env.URL_LAUNCHER_TOUCH_SIMULATE === '1' ? 1 : 0,
  URL_LAUNCHER_FRAME: process.env.URL_LAUNCHER_FRAME === '1' ? 1 : 0,
  URL_LAUNCHER_KIOSK: process.env.URL_LAUNCHER_KIOSK === '1' ? 1 : 0,
  URL_LAUNCHER_NODE: process.env.URL_LAUNCHER_NODE === '1' ? 1 : 0,
  URL_LAUNCHER_WIDTH: parseInt(process.env.URL_LAUNCHER_WIDTH || 1920, 10),
  URL_LAUNCHER_HEIGHT: parseInt(process.env.URL_LAUNCHER_HEIGHT || 1080, 10),
  URL_LAUNCHER_TITLE: process.env.URL_LAUNCHER_TITLE || 'RESIN.IO',
  URL_LAUNCHER_CONSOLE: process.env.URL_LAUNCHER_CONSOLE === '1' ? 1 : 0,
  URL_LAUNCHER_URL:
    process.env.URL_LAUNCHER_URL ||
    formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }),
  URL_LAUNCHER_ZOOM: parseFloat(process.env.URL_LAUNCHER_ZOOM || 1.0),
  URL_LAUNCHER_OVERLAY_SCROLLBARS: process.env.URL_LAUNCHER_OVERLAY_SCROLLBARS === '1' ? 1 : 0,
  ELECTRON_ENABLE_HW_ACCELERATION: process.env.ELECTRON_ENABLE_HW_ACCELERATION === '1',
  ELECTRON_RESIN_UPDATE_LOCK: process.env.ELECTRON_RESIN_UPDATE_LOCK === '1'
}

// Enable / disable hardware acceleration
if (!electronConfig.ELECTRON_ENABLE_HW_ACCELERATION) {
  app.disableHardwareAcceleration()
}

// enable touch events if your device supports them
if (electronConfig.URL_LAUNCHER_TOUCH) {
  app.commandLine.appendSwitch('--touch-devices')
}
// simulate touch events - might be useful for touchscreen with partial driver support
if (electronConfig.URL_LAUNCHER_TOUCH_SIMULATE) {
  app.commandLine.appendSwitch('--simulate-touch-screen-with-mouse')
}

if (isDevelopment) {
  // Don't load any native (external) modules until the following line is run:
  require('module').globalPaths.push(process.env.NODE_MODULES_PATH)

  /*eslint no-console:0*/
  console.log('Running in development mode')
  Object.assign(electronConfig, {
    URL_LAUNCHER_HEIGHT: 600,
    URL_LAUNCHER_WIDTH: 800,
    URL_LAUNCHER_KIOSK: 0,
    URL_LAUNCHER_CONSOLE: 1,
    URL_LAUNCHER_FRAME: 1
  })
}

// Listen for a 'resin-update-lock' to either enable, disable or check
// the update lock from the renderer process (i.e. the app)
if (electronConfig.ELECTRON_RESIN_UPDATE_LOCK) {
  const lockFile = require('lockfile')
  app.ipcMain.on('resin-update-lock', (event, command) => {
    switch (command) {
      case 'lock':
        lockFile.lock('/tmp/resin/resin-updates.lock', error => {
          event.sender.send('resin-update-lock', error)
        })
        break
      case 'unlock':
        lockFile.unlock('/tmp/resin/resin-updates.lock', error => {
          event.sender.send('resin-update-lock', error)
        })
        break
      case 'check':
        lockFile.check('/tmp/resin/resin-updates.lock', (error, isLocked) => {
          event.sender.send('resin-update-lock', error, isLocked)
        })
        break
      default:
        event.sender.send('resin-update-lock', new Error(`Unknown command "${command}"`))
        break
    }
  })
}

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })

function createMainWindow() {
  const window = new BrowserWindow({
    width: electronConfig.URL_LAUNCHER_WIDTH,
    height: electronConfig.URL_LAUNCHER_HEIGHT,
    frame: !!electronConfig.URL_LAUNCHER_FRAME,
    title: electronConfig.URL_LAUNCHER_TITLE,
    kiosk: !!electronConfig.URL_LAUNCHER_KIOSK
  })

  if (isDevelopment) {
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (electronConfig.URL_LAUNCHER_CONSOLE) window.webContents.openDevTools()
  } else {
    createProtocol('app')
    //   Load the index.html when not in development
    window.loadURL(electronConfig.URL_LAUNCHER_URL)
  }

  window.on('closed', () => {
    mainWindow = null
  })
  window.configuration = configContent ? JSON.parse(configContent) : {}
  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    await installVueDevtools()
  }
  mainWindow = createMainWindow()
})
