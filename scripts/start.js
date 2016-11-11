var http = require('http');
var url = require('url');
var filesystem = require('fs');

var config = {};

//читаем настройки
filesystem.readFile('../settings.json', function(err, dataRead){
    console.log('чтение настроек');
    if (err) {
        response.write('error');
        response.end();
        throw err;
    } else {
        JSON.parse(dataRead, function (key, value) {
            if (key == 'urlHosts') config.hostst = value;
        });
    }
    console.log('расширение готово к использованию');
});

function onRequest(request, response) {

    switch (url.parse(request.url).pathname) {
        case '/downLoadSettings':
            if (config.user == '') {
                response.write('showModalUser');
            } else {
                response.writeHead(200, {"Content-Type": "text/plain"});
                filesystem.readFile(config.hostst, function(err, dataRead){
                    if (err) {
                        response.write('error');
                        response.end();
                        throw err;
                    } else {
                        response.write(dataRead);
                        response.end();
                    }
                });
            }
            break;
        case '/save':
            response.writeHead(200, {"Content-Type": "text/plain"});
            request.on('data', function(chunk){
                filesystem.writeFile(config.hostst, chunk.toString(), function(err){
                    if (err) {
                        response.write('изменения не сохранены');
                        response.end();
                        throw err;
                    } else {
                        response.write('success');
                        response.end();
                    }
                });
            });
            break;
    }
}
http.createServer(onRequest).listen(1945);