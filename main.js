'use strict';

var useLoadingDelay = false; // использовать небольшую задержку для анимации загрузки данных ?
var loadingDelay = 500; // loadingDelay [ms] минимальное время анимации загрузки данных

var small = $('#small')[0];
var big   = $('#big')[0];
var title   = $('#title')[0];
var pageNumber   = $('#page-number')[0];
var selectRowsNumber   = $('#select-rows_number')[0];

var infoBox   = $('#info-box')[0];
var infoNm   = $('#info-name')[0];
var infoDsc   = $('#info-description')[0];
var infoAdr   = $('#info-adress')[0];
var infoTwn   = $('#info-town')[0];
var infoSt   = $('#info-state')[0];
var infoZp   = $('#info-zip')[0];

var table;
var url = ''; // источник данных для загрузки
var contacts = []; // массив для хранения контактов
var propCurrent; // свойство по которому сравниваются массивы

var rowMax = 50; // число отображаемых строк таблицы
var page = 0; // номер страницы
var pages = 0; // число страниц

var topNext = $('#top-next')[0];
var topPrev = $('#top-prev')[0];
var bottomNext = $('#bottom-next')[0];
var bottomPrev = $('#bottom-prev')[0];

function startLoading() {
        
    // находим число строк таблицы для вывода
    for (var i = 0; i < selectRowsNumber.options.length; i++) {
        var option = selectRowsNumber.options[i];
        if(option.selected) {
            rowMax = +option.value;            
        }
    }
    con('выбрано строк для вывода : ' + rowMax);
    
    // скрываем начальные элементы
    small.style.display = 'none';
    big.style.display = 'none';
    title.style.display = 'none';
    selectRowsNumber.parentNode.style.display = 'none'; // скрываем всю форму
    
    // показываем анимацию загрузки
    displayLoader(true);
    con('начало загрузки данных с сервера, показ анимации');

    // определяем источник загружаемых данных
    switch (this.id) {

        case 'small' :
            url = 'http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&adress=%7BaddressObject%7D&description=%7Blorem%7C32%7D';
            break;

        case 'big' :
            url = 'http://www.filltext.com/?rows=1000&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&delay=3&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&adress=%7BaddressObject%7D&description=%7Blorem%7C32%7D';
            break;                
    }        

    // параметры столбцов (интерфейс)
    var columns = [];        
    columns.push(new Column('id'       , 'small-col' , ' <span>&#9650;</span>', true));
    columns.push(new Column('firstName', 'normal-col', ' <span>&#9650;</span>', true));
    columns.push(new Column('lastName' , 'normal-col', ' <span>&#9650;</span>', true));
    columns.push(new Column('email'    , 'large-col' , ' <span>&#9650;</span>', true));
    columns.push(new Column('phone'    , 'big-col'   , ' <span>&#9650;</span>', true));

    // новая таблица
    var tblId = 'table';        
    table = new Table(tblId, columns, true);
    table.display(false);

    // создаем верхнюю строку
    table.addNewRow('top-row smooth-hover');
    table.rows[0].index = 0; // индекс строки как ссылка на контакт

    // заполняем верхнюю строку
    table.fillRowData(0, columns, 1);

    // запрашиваем данные с сервера
    $.getJSON(url, function(data) {

        con('данные получены');
        
        // парамаетры страницы
        page = 0;
        pages = Math.floor(data.length / rowMax);
        var rest = data.length - pages * rowMax;
        if (rest) pages++;
        
        con('страниц в таблице : ' + pages);
        
        contacts = data.slice(); // копия загруженных данных
        
        // начальная сортировка коллекции
        propCurrent = table.columns[0].name;        
        sortCollection(contacts, propCurrent);
        
        // sortCollection(contacts, propCurrent) сортирует только различные элементы в коллекции
        // одинаковые элементы остаются, как есть
        // для учета одинаковых элементов нужно включить расширить функцию compare(a, b), либо делать многоступенчатую сортировку (включая дополнительную сортировку по другим параметрам) - см. функцию checkSameData
        // в ходе отладки иногда возникало переполнение стека вызовов при использовании функции checkSameData, поэтому временно она не будет использована
        
//        checkSameData(table.columns, contacts, propCurrent, 0, contacts.length - 1);        
        
        con('коллекцию контактов отсортирована по параметру : ' + propCurrent);
                
        // создаем необходимое число строк
        table.createRows(Math.min(contacts.length, rowMax));
        
        // выводим информацию о контактах в таблицу
        table.fillContent(contacts, page);

        // скрываем анимацию загрузки
        con('скрываю анимацию');
        
        if (useLoadingDelay) {            
            // вариант c минимальной задержкой
            setTimeout(function () {
                displayLoader(false);
                table.display(true);
                showNavigationElements(page, pages);
            }, loadingDelay);
            
        } else {            
            // вариант без минимальной задержки
            displayLoader(false); 
            table.display(true);
            showNavigationElements(page, pages);
        }
    });
}

function displayLoader(flag) {
    // показать/скрыть анимацию загрузки данных
    
    (flag) ? $('#loader')[0].style.visibility = 'visible' : $('#loader')[0].style.visibility = '';
//    (flag) ? $('#loader')[0].style.display = 'block' : $('#loader')[0].style.display = 'none';

    // вариант с visibility работает быстрее варианта с display
}

function showNavigationElements(page, pages) {
    
    if (pages > 1) {
        
        if (page == 0) {
            // 1 страница
            topNext.style.visibility = 'visible';
            topPrev.style.visibility = '';
            bottomNext.style.visibility = 'visible';    
            bottomPrev.style.visibility = '';
            
        } else {
            
            if (page == pages - 1) {
                // последняя страница
                topNext.style.visibility = '';
                topPrev.style.visibility = 'visible';
                bottomNext.style.visibility = '';            
                bottomPrev.style.visibility = 'visible'; 
                
            } else {
                // промежуточная страница
                topNext.style.visibility = 'visible';
                topPrev.style.visibility = 'visible';
                bottomNext.style.visibility = 'visible';            
                bottomPrev.style.visibility = 'visible';                 
            }         
        }
        
        // показываем номер страницы
        displayPageNumber(true);
        
    } else {
        
        topNext.style.display = 'none';
        topPrev.style.display = 'none';
        bottomNext.style.display = 'none';    
        bottomPrev.style.display = 'none';
        displayPageNumber(false);
    }
    
    function displayPageNumber(flag) {
        pageNumber.innerHTML = 'page : ' + (page + 1);
        (flag) ? pageNumber.style.visibility = 'visible' : pageNumber.style.visibility = '';    
    }
}

// конструктор для объектов - таблица
function Table(tblId, columns, directionFlag) {

    this.table = $('#' + tblId)[0]; // DOM элемент
    this.rows = []; // массив строк
    this.columns = columns; // массив столбцов
    this.directionFlag = directionFlag; // флаг для определения направления сортировки (1 - по возрастанию, 0 - по убыванию)
    
    // установка ширины таблицы w px
    this.setWidth = function(w) {
        if (w) this.table.style.width = w + 'px';
    };
    
    // показать/скрыть таблицу по значению flag
    this.display = function(flag) {
        (flag) ? this.table.style.display = 'block' : this.table.style.display = 'none';
    };
    
    // добавление строки с классом rowClassName
    this.addNewRow = function(rowClassName) {

//        var self = this;
        var row = document.createElement('tr');
        this.rows.push(row);
        if (rowClassName) row.className = rowClassName;
        this.table.appendChild(row);

        var w = 0; // ширина таблицы

        for (var i = 0; i < columns.length; i++) {
            var cell = document.createElement('td');
            cell.className = columns[i].className;
            row.appendChild(cell);
            w += parseFloat(getComputedStyle(cell).width);
        }
        
        row.onclick = contactChoosed;
        
        // устанавливаем ширину таблицы
        this.setWidth(w);
    };

    this.fillRowData = function(rowIndex, data, topFlag) {
        // rowIndex - индекс строки
        // data - массив данных для заполнения
        // topFlag : 1 - верхняя строка, 0 - все остальные
        
        var self = this;
        var row = this.rows[rowIndex];
        var cells = row.getElementsByTagName('td');        
                
        // заполнение верхней строки
        if (topFlag) {
            
            // при topFlag == true, data - массив столбцов
            
            for (var i = 0; i < cells.length; i++) {
                
                cells[i].innerHTML = data[i].name + data[i].txt;                
                cells[i].tdIndex = i; // сохраняем ссылку на ячейку td
                cells[i].onclick = changeSortingDirection;
            }
            
            function changeSortingDirection() {
                // функция changeSortingDirection меняет порядок сортировки

                // получаем параметр сортировки                
                var index = this.tdIndex;
                
                // параметр сортировки
                var prop = self.columns[index].name;                
                
                // возвращаем исходные значения
                for (var i = 0; i < data.length; i++) {
                    
                    // кроме выбранного столбца
                    if (i != index) {
                        data[i].setDefaultValues();
                        cells[i].innerHTML = self.columns[i].name + self.columns[i].txt;
                    }                    
                }

                // поменялся ли столбец ?
                if (prop == propCurrent) {
                    // не поменялся -> делаем обратную сортировку
                    contacts.reverse();
                    
                    // меняем флаг для направления сортировки
                    self.directionFlag  = !self.directionFlag;
                    
                    // меняем значок навигации на противоположный
                    self.columns[index].changeRise();
                    cells[index].innerHTML = self.columns[index].name + self.columns[index].txt;                    
                   
                } else {
                    // поменялся -> делаем новую сортировку (по возрастанию)
                    self.directionFlag = true;
                    
                    propCurrent = prop;
                    sortCollection(contacts, prop);
                }
                
//                con('self.directionFlag : ' + self.directionFlag);
                page = 0; // возвращаемся на 1-ю страницу (с индексом 0)
                    
                // выводим новую информацию о контактах в таблицу
                self.fillContent(contacts, page);
                showNavigationElements(page, pages);
            }
            
        } else {
            // заполнение остальных строк
            // при topFlag == false, data - массив контактов
            
            // html
            for (var i = 0; i < data.length; i++) {                
                cells[i].innerHTML = data[i].data;
            }
            
            // выставляем новый row.index в зависимости от направления сортировки (значения self.directionFlag)
            if (!self.directionFlag) {
                 
                row.index = contacts.length - data[0].rowId + 2; // почему +2 - см. в отладчике;
                
            } else {
                
                row.index = data[0].rowId;
            }
        }
        
        // убираем скрытие строк (если оно было)
        row.style.display = '';
    };
    
    this.createRows = function(rowsNumber) {
        
        // создаем rowsNumber строк
        for (var i = 0; i < rowsNumber; i++) {
            this.addNewRow('');
        }        
    };
    
    this.hideRows = function(start, end) {
        // скрыть строки с индексами от start до end
        var rows = this.rows;
        
        // скрываем лишние строки
        for (var i = start; i <= end; i++) {
            rows[i].style.display = 'none';
            // при необходимости можно сбросить html для скрытых строк
        }
        
    }
    
    this.fillContent = function(data, page) {
        
        var self = this;
        var length = data.length;
        
        var rowsStartIndex = 0; // индекс контакта, с которого начинать заполнение таблицы
        var rowsEndIndex = 0; // индекс контакта, до которого проводить заполнение таблицы
        
        var rest = length - page * rowMax; // оставшееся число контактов
        
        if (rest >= rowMax) {
            // промежуточная страница
            rowsStartIndex = page * rowMax;
            rowsEndIndex = (page + 1) * rowMax;
            
            fillRows(data, rowsStartIndex, rowsEndIndex);

        } else {
            // последняя страница
            rowsStartIndex = page * rowMax;
            rowsEndIndex = length;
            
            fillRows(data, rowsStartIndex, rowsEndIndex);
            // скрываем оставшиеся строки
            if (page) this.hideRows(rest + 1, rowMax);
        }

        function fillRows(data, rowsStartIndex, rowsEndIndex) {
            
            // заполнение строк с номерами от rowsStartIndex до rowsEndIndex            
            for (var i = 0; i < rowsEndIndex - rowsStartIndex; i++) {
                
                // colData - массив данных для строки, индекс элемента в colData = индекс столбца
                var colData = [];
                
                // добавляем данные в colData
                for (var j = 0; j < self.columns.length; j++) {
                    
                    var rowIndex = rowsStartIndex + i;
                    
                    // меняем индекс на противоположный при сортировке по убыванию
                    if (!self.directionFlag) rowIndex = contacts.length - rowIndex;
                    
                    var obj = {
                                data  : data[rowsStartIndex + i][self.columns[j].name], // данные для заполнения строки
                                rowId : (rowIndex + 1) // rowId - внутренняя переменная (индекс строки); + 1 - т.к. есть еще и верхняя строка
                              };
                    
                    colData.push(obj);
                }
                
                // заполняем таблицу
                self.fillRowData(i+1, colData, 0);
            }                
        }    
    };
    
    this.launchPage = function(data, page, pages) {

        // заполняем новые данные
        this.fillContent(data, page);
        
        // отображаем навигацию
        showNavigationElements(page, pages);
    };    
}

// конструктор для объектов - столбцец
function Column(name, className, txt, rise) {
    this.name = name;
    this.className = className;
    this.txt = txt;
    this.rise = rise;
    
    // установка значений для исходного направления сортировки
    this.setDefaultValues = function() {
        this.rise = true;
        this.txt  = ' <span>&#9650;</span>'; 
    };
    
    // изменение направления сортировки
    this.changeRise = function() {
        
        this.rise = !this.rise;

        if (this.rise) 
            this.txt =  ' <span>&#9650;</span>';
        else
            this.txt =  ' <span>&#9660;</span>';
    };
}

function sortCollection(collection, parameter) {

    collection.sort(compare);

    // функция сравнения
    function compare(a, b) {
        if (parameter === 'id') {
            // сравнение числовых данных
            return a[parameter] - b[parameter];
                
        } else {
            // сравнение строковых данных
            if (a[parameter] > b[parameter]) return 1;
            if (a[parameter] < b[parameter]) return -1;
            
//            if (a[parameter] == b[parameter]) {
//                for (var i = 0; i < table.columns.length; i++) {
//                    
//                }
//                return ...
//            }            
        }
    }
}

function checkSameData(cols, collection, parameter, startIndex, endIndex) {
    
//    var cols = table.columns; // массив столбцов (как объектов)
    var propIndex = 0; // индекс параметра сортировки в общем массиве
    var arr = []; // массив строк с одинаковым значением параметра parameter;
    // parameter - свойство по которому ранее была произведена сортировка
    // startIndex - индекс контакта, с которого начинать сравнение элементов
//    var goNext = true;
    
    for (var i = startIndex; i < endIndex; i++) {

        while (collection[i + 1][parameter] == collection[i][parameter]) {

            // формируем массив arr 
            arr.push(collection[i]);
            if (i == (collection.length - 2)) {
                break;
            } else {
                i++;
            }
        }            
        
        // проверяем есть ли совпадения
        if (arr.length) {

            // добавляем последний элемент
            arr.push(collection[i]);
            
            // сортировка коллекции arr по свойствам в порядке их следования в массиве cols
            for (var j = propIndex; j < cols.length; j++) {

                if (arr.length) {
                    if (cols[j].name == parameter) continue; // сортировка уже была произведена
                    sortCollection(arr, cols[j].name);

                    var start = i - arr.length + 1;
                    var end = i;

                    var c = collection.slice();

                    for (var k = 0; k < arr.length; k++) {
                        collection[k + start] = arr[k];
                    }

                    arr = [];

                    checkSameData(cols, collection, cols[j + 1].name, start, end);                        
                } else {
                    break;
                }
            }
        }
    }       
}

function goNextPage() {
    page++;
    table.launchPage(contacts, page, pages);
    
}

function goPrevPage() {
    page--;
    table.launchPage(contacts, page, pages);
}

function displayInfoBox(flag) {
    (flag) ? infoBox.style.visibility = 'visible' : infoBox.style.visibility = '';    
}

function contactChoosed() {
    
    if(this.index > 0) {
        // выбрана не верхняя строка

//        con('index : ' + this.index);
        
        var contact = contacts[this.index - 1];
        
        // выводим информацию по контакту
        fillContact(contact);
        
        function fillContact(contact) {
            
            infoNm.innerHTML = 'Выбран пользователь: <b>' + contact.firstName + ' ' + contact.lastName + '</b></p>';
            infoDsc.innerHTML = contact.description;
            infoAdr.innerHTML = 'Адрес проживания: <b>' + contact.adress.streetAddress + '</b></p>';
            infoTwn.innerHTML = 'Город: <b>' + contact.adress.city + '</b></p>';
            infoSt.innerHTML = 'Провинция/штат: <b>' + contact.adress.state + '</b></p>';
            infoZp.innerHTML = 'Индекс: <b>' + contact.adress.zip + '</b></p>';
        }
        
        // показываем бокс с информацией
        displayInfoBox(true);        
    }

}

// ***   ОТЛАДКА   ***
// вывод информации о ходе выполнения программы
function con(msg) {
    console.log(msg);
}

small.onclick = startLoading;
big.onclick   = startLoading;

topNext.onclick = goNextPage;
topPrev.onclick = goPrevPage;
bottomNext.onclick = goNextPage;
bottomPrev.onclick = goPrevPage;

    
