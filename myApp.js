const { menubar } = require('menubar');
const AutoLaunch = require('auto-launch');

const mb = menubar({
  index: 'http://localhost:4000',
  icon: 'public/icon.png',
  browserWindow: {
    width: 200,
    height: 200
  }
});

mb.on('ready', () => {
  console.log('Menubar app is ready.');
  let autoLaunch = new AutoLaunch({
    name: 'Your app name goes here',
    path: app.getPath('exe'),
  });
  autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLaunch.enable();
  });
});
