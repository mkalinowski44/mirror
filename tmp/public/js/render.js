const {remote, ipcRederer, shell} = require('electron');

document.getElementById('minimize-button').addEventListener('click', () => {
    remote.getCurrentWindow().minimize();
});
document.getElementById('min-max-button').addEventListener('click', () => {
    const currentWindow = remote.getCurrentWindow();
    if(currentWindow.isMaximized()) {
        currentWindow.unmaximize();
    } else {
        currentWindow.maximize();
    }
});
document.getElementById('close-button').addEventListener('click', () => {
    remote.getCurrentWindow().close();
});
// document.getElementById('dev').addEventListener('click', () => {
//     remote.getCurrentWindow().toggleDevTools();
// });
document.getElementById('opanInBrowser').addEventListener('click', () => {
    shell.openExternal('http://127.0.0.1:'+port);
    remote.getCurrentWindow().minimize();
});
$("a:not(.system)").click(() => {
    $('body').css('opacity', '0');
});
$(".form").submit(() => {
    $('body').css('opacity', '0');
})