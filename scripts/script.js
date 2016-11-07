var body = document.getElementsByTagName('body')[0],
    viewBlock = document.getElementById('viewBlock'),
    btnAbout = document.getElementById('btnAboutServer'),
    modalNodeJs = document.getElementById('modalNodeJs'),
    btnChangeDev = document.getElementById('btnChangeDev'),
    btnChangeBattle = document.getElementById('btnChangeBattle'),
    btnSave = document.getElementById('btnSave'),
    labelStatus = document.getElementById('labelStatus'),
    modalAbout = document.getElementById('modalAbout'),
    btnUpdate = document.getElementById('btnUpdate'),
    linkBlank = document.getElementById('linkBlank');

document.addEventListener('DOMContentLoaded', function(){
    //загружаем hosts
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:1945/downLoadSettings');
    xhr.send();
    xhr.onreadystatechange = function(){
        if (xhr.status == 200) {
            body.classList.remove('loading');
            viewBlock.innerHTML = xhr.responseText;

        } else {
            modalNodeJs.classList.add('active');
        }
    };
    //TODO проверка обновлений
});

//о текущем сервере
btnAbout.addEventListener('click', function () {
    chrome.tabs.query( {active: true} , function(tabs){
        var xhr = new XMLHttpRequest(),
            url = tabs[0].url;
        //TODO lk., secure.   ;   надо сделать чтобы работало для Беларуси и Казахстана
        url = url.substring(0, url.indexOf('wildberries.ru')) + 'wildberries.ru' + '/_about';
        xhr.open('GET', url);
        xhr.send();
        xhr.onreadystatechange = function(){
            modalAbout.classList.add('active');
            if (xhr.status != 200) {
                modalAbout.getElementsByClassName('jsMessage')[0].innerHTML = "что-то пошло не так"
            } else {
                modalAbout.getElementsByClassName('jsMessage')[0].innerHTML = xhr.responseText;
            }
        };
    });
});

//изменения в viewBlock
viewBlock.addEventListener('keydown', function () {
    btnSave.classList.add('active');
});

//на дев
btnChangeDev.addEventListener('click', function () {
    if (btnChangeDev.classList.contains('active')) {
        viewBlock.classList.remove('aboutServer');
        viewBlock.innerText = delComments(viewBlock.innerText);
        btnSave.classList.add('active');
    }
});

//на бой
btnChangeBattle.addEventListener('click', function () {
    if (btnChangeBattle.classList.contains('active')) {
        viewBlock.classList.remove('aboutServer');
        viewBlock.innerText = addComments(viewBlock.innerText);
        btnSave.classList.add('active');
    }
});

//сохранить
//TODO добавить ссылку
btnSave.addEventListener('click', function () {
    if (btnSave.classList.contains('active')) {
        saveHosts('сохранено');
        btnSave.classList.remove('active');

        chrome.browsingData.removeCache({"since": 0}, function() {
            chrome.tabs.getSelected(function(tab){
                //TODO надо чтобы подставлялю для боя https а для дева http иначе сброш кеша не помогает
                linkBlank.innerHTML = '<a href="' + tab.url + '" target="_blank">перейти</a>'
            })
        });
    }
});

//события модальников - закрыть
body.addEventListener('click', function (e) {
    if (e.target.classList.contains('jsCloseModal')) {
        e.target.parentNode.parentNode.classList.remove('active')
    }
});

//-------------------------------------------функции попёрли------------------------------------------

function changeStatus(text) {
    labelStatus.innerText = text;
    labelStatus.classList.add('active');
    setTimeout(function () {
        labelStatus.classList.remove('active');
    }, 1000);
}

function delComments(input) {
    var i = 0,
        output = '',
        regexp = /[0-9]/;

    while (i < input.length){
        if (!(input[i] == '#')) {
            output = output + input[i];
        } else if (!regexp.test(input[i+1])){  //регулярка чтобыпонять что идёт после комметария, вдруг обычный комментарий
            output = output + input[i];
        }
        i++;
    }
    return output;
}

function addComments(input) {
    var i = 0,
        output = '';

    while (i < input.length) {
        if ((i == 0) && (input[i]!='\n')) {
            output = output + '#';
        }
        if (input[i] == '\n') {
            // console.log('input[i] = ' + input[i]);
            output = output + '\n#';
        } else {
            output = output + input[i];
        }
        i++;
    }
    return output;
}

function saveHosts(textMessage) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:1945/save');
    xhr.send(viewBlock.innerHTML);
    xhr.onreadystatechange = function(){
        if (xhr.status == 200) {
            // chrome.browsingData.removeCache();
            changeStatus(textMessage)
        }
    };
}