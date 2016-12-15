var version = '1.4_0';
var user = localStorage.getItem('setUser');

var body = document.getElementsByTagName('body')[0],
    viewBlock = document.getElementById('viewBlock'),
    btnAbout = document.getElementById('btnAboutServer'),
    modalNodeJs = document.getElementById('modalNodeJs'),
    btnSave = document.getElementById('btnSave'),
    labelStatus = document.getElementById('labelStatus'),
    modalAbout = document.getElementById('modalAbout'),
    linkBlank = document.getElementById('linkBlank'),
    modalUser = document.getElementById('modalUser'),
    labelSetPath = document.getElementById('labelSetPath'),
    inputUser = document.getElementById('inputUser'),
    btnSetUser = document.getElementById('btnSetUser'),
    btnModalCopy = document.getElementById('btnModalCopy'),
    btnChangeUser = document.getElementById('btnChangeUser');

var arrHosts = []; //массив строк из hosts

document.addEventListener('DOMContentLoaded', function(){
    inputUser.value = user;
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
                modalAbout.getElementsByClassName('jsMessage')[0].innerHTML = xhr.responseText;
            }
        };
    });
});

//изменения в viewBlock
viewBlock.addEventListener('keydown', function () {
    btnSave.classList.add('active');
});

//сохранить
btnSave.addEventListener('click', function () {
    if (btnSave.classList.contains('active')) {
        saveHosts('сохранено');
        btnSave.classList.remove('active');
        chrome.browsingData.removeCache({'since': 0}, function() {
            chrome.tabs.getSelected(function(tab){
                linkBlank.classList.add('active');
                linkBlank.setAttribute('href' , tab.url );
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

//смена пользователя windows
btnChangeUser.addEventListener('click', function () {
    modalUser.classList.add('active');
});

//-------------------------------------------функции попёрли------------------------------------------

function changeStatus(text) {
    labelStatus.innerText = text;
    labelStatus.classList.add('active');
    setTimeout(function () {
        labelStatus.classList.remove('active');
    }, 1000);
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
    var xhr = new XMLHttpRequest();
    xhr.timeout = 1000;
    xhr.open('GET', 'http://localhost:1945/downLoadSettings');
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                modalNodeJs.classList.remove('active');
                fillArray(xhr.responseText);
                fillDOM(arrHosts);
            } else {
                if (user == null) {
                    modalUser.classList.add('active');
                } else {
                    labelSetPath.innerText = 'C:\\Users\\' + user + '\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\ephenaienpdfchppeeefjgfoomooffid\\' + version + '\\scripts';
                    modalNodeJs.classList.add('active');
                }
            }
        }
    };
}

function fillDOM(arrayH) {
    viewBlock.innerText = '';
    for (var countLine = 0; countLine < arrayH.length; countLine++) {

        if (!((arrayH[countLine] == '')&&(arrayH[countLine + 1] == ''))) {
            var comment = '';
            (/[#]/).test(arrayH[countLine]) ? comment = true : comment = false;
            viewBlock.innerHTML = viewBlock.innerHTML +
                '<span class="itemLineHosts" data-comment="' + comment + '" tabindex="' + countLine + '" >' +
                    '<span class="jsHostsItem">' + arrayH[countLine] + '</span>' +
                    '<button class="itemLineHostsEdit" title="редактировать"></button>' +
                '</span>';
        }
    }

    body.addEventListener('click', function (e) {
        var currentEl = e.target;
        if (e.target.classList.contains('itemLineHostsEdit')) {
            e.stopPropagation();
            var editLine = currentEl.parentNode,
                range = document.createRange(),
                sel = window.getSelection();
            editLine.setAttribute('contenteditable', 'true');
            range.setStart(editLine.getElementsByClassName('jsHostsItem')[0].firstChild, editLine.innerText.length);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            editLine.getElementsByClassName('jsHostsItem')[0].focus();
            return;
        }

        var flagClickLineHosts = e.target.classList.contains('itemLineHosts'),
            flagClickParentHosts = e.target.parentNode.classList.contains('itemLineHosts');

        if (flagClickLineHosts || flagClickParentHosts) {
            btnSave.classList.add('active');
            flagClickLineHosts ? currentEl = e.target : currentEl = e.target.parentNode;
            currentEl.setAttribute('contenteditable', 'false');
            if (currentEl.getAttribute('data-comment') == 'true') {
                currentEl.setAttribute('data-comment', 'false');
                currentEl.innerHTML =
                    '<span class="jsHostsItem">' + currentEl.innerText.slice(1) + '</span>' +
                    '<button class="itemLineHostsEdit" title="редактировать"></button>'
            } else {
                currentEl.setAttribute('data-comment', 'true');
                currentEl.innerHTML =
                '<span class="jsHostsItem">#'+ currentEl.innerText + '</span>' +
                '<button class="itemLineHostsEdit" title="редактировать"></button>'
            }
        }
    });
}

function fillArray(stringH) {
    for (var i = 0; i < stringH.length; i++) {
        if (i == 0) { //первый символ
            arrHosts.push(disconnectLineHosts(i, 0));
        }
        if (stringH[i] == '\n') {
            arrHosts.push(disconnectLineHosts(i + 1, i + 1));
        }
    }
    function disconnectLineHosts(countBegin, countEnd) {
        for (countEnd; countEnd <= stringH.length; countEnd++) {
            if (stringH[countEnd] == '\n') {
                return stringH.slice(countBegin, countEnd);
            }
            if (countEnd == stringH.length) {   //последняя строчка
                stringH = stringH.slice(countBegin, stringH.length);
                return stringH;
            }
        }
    }
}