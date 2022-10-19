import { app, BrowserWindow,globalShortcut, screen, ipcMain } from 'electron'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

app.commandLine.appendSwitch('--ignore-certificate-errors', 'true')

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`


function createWindow () {
  let size = screen.getPrimaryDisplay().workAreaSize
  let sWidth = size.width;
  let sHeight = size.height;

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: sHeight,
    //useContentSize: true,
    width: sWidth,
    kiosk:true,
    show: false,
    webPreferences:{
      webSecurity: false,
      allowRunningInsecureContent:true,
      allowDisplayingInsecureContent:true,
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  });

  mainWindow.on('ready-to-show', function () {
    mainWindow.show();
  })

  let ret = globalShortcut.register('f6', function() {
    mainWindow.webContents.openDevTools();
  });
  if (!ret) console.log("register f6 fail!")
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.commandLine.appendSwitch('disable-pinch');

//最小化
ipcMain.on('window-all-minimize', (event, arg) => {
  mainWindow.minimize()
});
//关闭
ipcMain.on('window-all-closed', (event, arg) => {
  mainWindow.close();
})