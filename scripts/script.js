var version = '1.2_0';
var user = localStorage.getItem('setUser')

var body = document.getElementsByTagName('body')[0],
    viewBlock = document.getElementById('viewBlock'),
    btnAbout = document.getElementById('btnAboutServer'),
    modalNodeJs = document.getElementById('modalNodeJs'),
    btnChangeDev = document.getElementById('btnChangeDev'),
    btnChangeBattle = document.getElementById('btnChangeBattle'),
    btnSave = document.getElementById('btnSave'),
    labelStatus = document.getElementById('labelStatus'),
    modalAbout = document.getElementById('modalAbout'),
    linkBlank = document.getElementById('linkBlank'),
    modalUser = document.getElementById('modalUser'),
    labelSetPath = document.getElementById('labelSetPath'),
    inputUser = document.getElementById('inputUser'),
    btnSetUser = document.getElementById('btnSetUser'),
    btnModalCopy = document.getElementById('btnModalCopy');

document.addEventListener('DOMContentLoaded', function(){
    testNodeJs();
});

//о текущем сервере
btnAbout.addEventListener('click', function () {
    chrome.tabs.query( {active: true} , function(tabs){
        var xhr = new XMLHttpRequest(),
            url = tabs[0].url;
        url = url.substring(0, url.indexOf('wildberries.ru')) + 'wildberries.ru' + '/_about';
        xhr.open('GET', url);
        xhr.send();
        xhr.onreadystatechange = function(){
            modalAbout.classList.add('active');
            if (xhr.status != 200) {
                modalAbout.getElementsByClassName('jsMessage')[0].innerText = "что-то пошло не так"
            } else {
                modalAbout.getElementsByClassName('jsMessage')[0].innerText = xhr.responseText;
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
btnSave.addEventListener('click', function () {
    if (btnSave.classList.contains('active')) {
        saveHosts('сохранено');
        btnSave.classList.remove('active');
        chrome.browsingData.removeCache({"since": 0}, function() {
            chrome.tabs.getSelected(function(tab){
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

//поле для юзера в модальнике ввода юзера
inputUser.addEventListener('keyup', function () {
    if (inputUser.value != '') {
        btnSetUser.classList.add('active');
    } else {
        btnSetUser.classList.remove('active')
    }
});

//установка имени пользователя
btnSetUser.addEventListener('click', function () {
   if (btnSetUser.classList.contains('active')) {
       localStorage.setItem('setUser', user = inputUser.value);
       modalUser.classList.remove('active');
       testNodeJs();
   }
});

//копировать в буфер
btnModalCopy.addEventListener('click', function () {
    if (btnModalCopy.classList.contains('active')) {
        var range = document.createRange();
        range.selectNodeContents(document.querySelector('.jsCopyText'));
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        btnModalCopy.classList.remove('active');
        btnModalCopy.innerText = 'скопировано';
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
    xhr.send(viewBlock.innerText);
    xhr.onreadystatechange = function(){
        if (xhr.status == 200) {
            // chrome.browsingData.removeCache();
            changeStatus(textMessage)
        }
    };
}

function testNodeJs() {
    //загружаем hosts
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:1945/downLoadSettings');
    xhr.send();
    body.classList.remove('loading');
    if (xhr.status == 200) {
        viewBlock.innerText = xhr.responseText;
    } else {
        if (user == null) {
            modalUser.classList.add('active');
        } else {
            labelSetPath.innerText = 'C:\\Users\\' + user + '\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\ephenaienpdfchppeeefjgfoomooffid\\' + version + '\\scripts';
            modalNodeJs.classList.add('active');
        }
    }
}