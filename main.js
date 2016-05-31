'use strict';

var useLoadingDelay = false; // использовать небольшую задержку для анимации загрузки данных ?
var loadingDelay = 500; // loadingDelay [ms] минимальное время анимации загрузки данных

var small = $('#small')[0];
var big   = $('#big')[0];
var title   = $('#title')[0];

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
    
    // скрываем начальные элементы
    small.style.display = 'none';
    big.style.display = 'none';
    title.style.display = 'none';
    
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
    table = new Table(tblId, columns);
    table.display(false);

    // создаем верхнюю строку
    table.addNewRow('top-row smooth-hover');        

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
        
        con('коллекцию контактов отсортирована по параметру : ' + 'id');
                
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
                showNavigationButtons(page, pages);
            }, loadingDelay);
            
        } else {
            
            // вариант без минимальной задержки
            displayLoader(false); 
            table.display(true);
            showNavigationButtons(page, pages);
        }
    });
}

function displayLoader(flag) {
    // показать/скрыть анимацию загрузки данных
    
    (flag) ? $('#loader')[0].style.visibility = 'visible' : $('#loader')[0].style.visibility = '';
//    (flag) ? $('#loader')[0].style.display = 'block' : $('#loader')[0].style.display = 'none';

    // вариант с visibility работает быстрее варианта с display
}

function showNavigationButtons(page, pages) {
    
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
    }
    
//    if (allMax >= pageMax) {
//        if (page == 0) {
//            topNext.style.visibility = 'visible';
//            bottomNext.style.visibility = 'visible';
//        }
//    }
    
}

// конструктор для объектов - таблица
function Table(tblId, columns) {

    this.table = $('#' + tblId)[0];
    this.rows = [];
    this.columns = columns;
    
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

        var self = this;
        var row = document.createElement('tr');
        this.rows.push(row);
        if (rowClassName) row.className = rowClassName;
        self.table.appendChild(row);

        var w = 0; // ширина таблицы

        for (var i = 0; i < columns.length; i++) {
            var cell = document.createElement('td');
            cell.className = columns[i].className;
            row.appendChild(cell);
            w += parseFloat(getComputedStyle(cell).width);
        }
        
        // устанавливаем ширину таблицы
        self.setWidth(w);
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
            // здесь data - массив столбцов
            
            for (var i = 0; i < cells.length; i++) {
                
                cells[i].innerHTML = data[i].name + data[i].txt;
                
                cells[i].propIndex = i; // сохраняем ссылку на элемент
                cells[i].onclick = changeSortingDirection;
            }
            
            function changeSortingDirection() {
                // функция changeSortingDirection меняет порядок сортировки
                
                // получаем параметр сортировки                
                var index = this.propIndex;
                // параметр сортировки
                var prop = self.columns[index].name;                
                
                for (var i = 0; i < data.length; i++) {
                    
                    // возвращаем исходные значения
                    if (i != index) { 
                        // кроме выбранного столбца
                        data[i].setDefaultValues();
                        cells[i].innerHTML = self.columns[i].name + self.columns[i].txt;
                    }                    
                }

                // поменялся ли столбец ?
                if (prop == propCurrent) {
                    // не поменялся -> делаем обратную сортировку
                    contacts.reverse();
                    
                    // меняем значок навигации на противоположный
                    self.columns[index].changeRise();
                    cells[index].innerHTML = self.columns[index].name + self.columns[index].txt;                    
                   
                } else {
                    // поменялся -> делаем новую сортировку (по возрастанию)
                    propCurrent = prop;
                    sortCollection(contacts, prop);
//                    page = 0;
                }
                
                page = 0; // возвращаемся на 1-ю страницу
                    
                // выводим новую информацию о контактах в таблицу
                self.fillContent(contacts, page);
                showNavigationButtons(page, pages);
            }
            
        } else {
            // заполнение остальных строк
            // здесь data - массив контактов
            
            for (var i = 0; i < data.length; i++) {                
                cells[i].innerHTML = data[i];
            }         
        }
        
        // убираем скрытие строк (если оно было)
        row.style.display = '';
    };
    
    this.createRows = function(rowsNumber) {
        
        var self = this;
        
        for (var i = 0; i < rowsNumber; i++) {
            self.addNewRow('');
        }        
    };
    
    this.hideRows = function(start, end) {
        // скрыть строки с индексами от start до end
        var self = this;
        
        var rows = self.rows;
        
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
            // 
            rowsStartIndex = page * rowMax;
            rowsEndIndex = (page + 1) * rowMax;
            
            fillRows(data, rowsStartIndex, rowsEndIndex);

        } else {
            rowsStartIndex = page * rowMax;
            rowsEndIndex = length;
            
            fillRows(data, rowsStartIndex, rowsEndIndex);
            if (page) self.hideRows(rest + 1, rowMax);
        }

        function fillRows(data, rowsStartIndex, rowsEndIndex) {            
            
            // создание/заполнение строк с номерами от rowsStartIndex до rowsEndIndex
            
            for (var i = 0; i < rowsEndIndex - rowsStartIndex; i++) {
                
//                if (createFlag) self.addNewRow(''); // создание строки при первой загрузке
                
                // colData - массив данных для строки, индекс элемента в colData = индекс столбца
                var colData = [];
                
                // добавляем данные в colData
                for (var j = 0; j < self.columns.length; j++) {
                    self.columns[j];
                    colData.push(data[rowsStartIndex + i][self.columns[j].name]);
                }
                
                // заполняем таблицу
                self.fillRowData(i+1, colData, 0);
            }                
        }    
    };
    
    this.launchPage = function(data, page, pages) {
        var self = this;
    
        self.fillContent(data, page);
    
        showNavigationButtons(page, pages);
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
//            if (a[parameter] == b[parameter]) {
//                return ...
//            }
            if (a[parameter] > b[parameter]) return 1;
            if (a[parameter] < b[parameter]) return -1;
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

//function launchPage() {
//    
//    // загрузка новых данных для страницы page
////    con('page : ' + page);
//    
////    var l = contacts.length;
//    
////    if (l - page * rowMax >= rowMax) table.fillContent(contacts, page);
//    table.fillContent(contacts, page);
//    
//    showNavigationButtons(page, pages);
//}

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

    
