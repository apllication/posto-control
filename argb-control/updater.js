const { autoUpdater } = require('electron-updater');

function setupAutoUpdater({ app, getWindow, log = console.log }) {
  if (!app.isPackaged) {
    log('[Atualização] modo desenvolvimento: verificação automática desativada.');
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.autoInstallEvent = 'onNextLaunch';
  autoUpdater.allowPrerelease = false;

  const send = (type, extra = {}) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) win.webContents.send('update-status', { type, ...extra });
  };

  autoUpdater.on('checking-for-update', () => { log('[Atualização] procurando nova versão...'); send('checking'); });
  autoUpdater.on('update-available', info => { log(`[Atualização] nova versão encontrada: ${info.version}`); send('available', { version: info.version }); });
  autoUpdater.on('download-progress', p => send('progress', { percent: Number(p.percent || 0), transferred: p.transferred, total: p.total }));
  autoUpdater.on('update-downloaded', info => { log(`[Atualização] versão ${info.version} baixada. Será instalada na próxima abertura.`); send('downloaded', { version: info.version }); });
  autoUpdater.on('update-not-available', info => { log('[Atualização] aplicativo já está atualizado.'); send('not-available', { version: info.version }); });
  autoUpdater.on('error', err => { log(`[Atualização] erro: ${err.message}`); send('error', { message: err.message }); });

  setTimeout(() => autoUpdater.checkForUpdates().catch(err => log(`[Atualização] ${err.message}`)), 5000);
  return () => autoUpdater.checkForUpdates().catch(err => ({ error: err.message }));
}

module.exports = { setupAutoUpdater };
