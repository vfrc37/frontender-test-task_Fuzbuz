//    var small = $('#small');
//    var big   = $('#big');

//    $('#small')[0].onclick = startLoading;
$('#small').bind('click', startLoading);
$('#big').bind('click', startLoading);
//    $('#big')[0].onclick = startLoading;
//    small.onclick = startLoading;
//    big.onclick   = startLoading;

var url = ''; // источник данных для загрузки
var contacts = []; // массив для хранения контактов
var propCurrent; // свойство по которому сравниваются массивы

var rowMax = 40; // число отображаемых строк таблицы
var page = 0; // номер страницы

function startLoading() {

    // показываем анимацию загрузки
    $('#small')[0].style.display = 'none';
    $('#big')[0].style.display = 'none';
    $('#title')[0].style.display = 'none';
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

    // параметры столбцов
    var columns = [];        
    columns.push(new Column('id'       , 'small-col' , ' <span>&#9650;</span>', true));
    columns.push(new Column('firstName', 'normal-col', ' <span>&#9650;</span>', true));
    columns.push(new Column('lastName' , 'normal-col', ' <span>&#9650;</span>', true));
    columns.push(new Column('email'    , 'large-col' , ' <span>&#9650;</span>', true));
    columns.push(new Column('phone'    , 'big-col'   , ' <span>&#9650;</span>', true));

    // новая таблица
    var tblId = 'table';        
    var table = new Table(tblId, columns);
    table.display(false);

    // создаем верхнюю строку
    table.addNewRow('top-row smooth-hover');        

    // заполняем верхнюю строку
    table.fillRowData(0, columns, 1);

    // запрашиваем данные с сервера
    $.getJSON(url, function(data) {

        con('данные получены');
        contacts = data.slice(); // копия загруженных данных

//            console.log('contacts.length : ' + contacts.length);
//            console.log('contacts[0] : ' + contacts[0]);
//            var mail = contacts[0].adress.city;
        
        // начальная сортировка коллекции
        propCurrent = table.columns[0].name;        
        sortCollection(contacts, propCurrent);
//            check(contacts, 'id');
        con('коллекцию контактов отсортирована по параметру : ' + 'id');
                
        // выводим информацию о контактах в таблицу
        table.fulfill(contacts, 1);

        // скрываем анимацию загрузки
        con('скрываю анимацию');
//            displayLoader(false); // вариант без минимальной задержки
//            table.display(true);
        setTimeout(function () {
            displayLoader(false);
            table.display(true);
            showNavigationButtons(page, rowMax, contacts.length);
        }, 500); // 500 ms - минимальное время анимации
    });
}

function displayLoader(flag) {
    // показать/скрыть анимацию загрузки данных    
    // вариант с visibility работает быстрее варианта с display
    
//        (flag) ? $('#loader')[0].style.display = 'block' : $('#loader')[0].style.display = 'none';
    (flag) ? $('#loader')[0].style.visibility = 'visible' : $('#loader')[0].style.visibility = '';
}

function showNavigationButtons(page, pageMax, allMax) {

    var topNext = $('#top-next')[0];
    var topPrev = $('#top-prev')[0];
    var bottomNext = $('#bottom-next')[0];
    var bottomPrev = $('#bottom-prev')[0];

    if (allMax >= pageMax) {
        if (page == 0) {
            topNext.style.visibility = 'visible';
            bottomNext.style.visibility = 'visible';
        }
    }
    
}
//    columns

function Table(tblId, columns) {

    this.table = $('#' + tblId)[0];
    this.rows = [];
    this.columns = columns;

    this.setWidth = function(w) {
        if (w) this.table.style.width = w + 'px';
    }

    this.display = function(flag) {
        (flag) ? this.table.style.display = 'block' : this.table.style.display = 'none';
    }

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

    this.fillRowData = function(rowIndex, array, topFlag) {
        // topFlag : 1 - верхняя строка, 0 - все остальные
        var self = this;
        var row = this.rows[rowIndex];
        var cells = row.getElementsByTagName('td');        
        
        if (topFlag) {
            
            for (var i = 0; i < cells.length; i++) {
                // array - массив столбцов                
                cells[i].innerHTML = array[i].name + array[i].txt;
                
                cells[i].propIndex = i; // сохраняем ссылку на элемент
                cells[i].onclick = changeSortingDirection;
            }
            
            function changeSortingDirection() {
                                
                // получаем параметр сортировки                
                var index = this.propIndex;
                
                // меняем текст на противоположный
                self.columns[index].changeRise();
                cells[index].innerHTML = self.columns[index].name + self.columns[index].txt;
                
                // поменялся ло параметр сортировки ?
                var prop = self.columns[index].name;              
                
                if (prop == propCurrent) {
                    // не поменялся -> просто делаем обратный порядок
                    contacts.reverse();
                } else {
                    // поменялся -> делаем новую сортировку
                    propCurrent = prop;
                    sortCollection(contacts, prop);
                }
                    
                // выводим новую информацию о контактах в таблицу
                self.fulfill(contacts, 0);
            }
            

//            
//            cells[i].onclick = function() {
//                        array[i].changeRise();
//                        cells[i].innerHTML = array[i];
//                    } 
            
        } else {
            
            for (var i = 0; i < array.length; i++) {
                // array - массив контактов
                cells[i].innerHTML = array[i];
            }         
        }

    };
    
    this.fulfill = function(contacts, createFlag) {
        var table = this;
        var length = contacts.length;

        if (length <= rowMax) {

            fillRows(table, contacts, length);
            con('контактов : ' + length + ' не больше ' + rowMax + ', навигация по страницам не нужна');

        } else {

            fillRows(table, contacts, rowMax);
            con('контактов : ' + length + ' больше ' + rowMax + ', делаю навигацию по страницам');
        }

        function fillRows(table, data, rowsNumber) {

            for (var i = 0; i < rowsNumber; i++) {
                if (createFlag) table.addNewRow('');
                var colData = [];

                var table;

                for (var j = 0; j < table.columns.length; j++) {
                    table.columns[j];
                    colData.push(data[i][table.columns[j].name]);
                }        
        //        colData.push(data[i].id);
        //        colData.push(data[i].firstName);
        //        colData.push(data[i].lastName);
        //        colData.push(data[i].email);
        //        colData.push(data[i].phone);

                table.fillRowData(i+1, colData, 0);
            }                
        }    
    }    
    
    

//    this.addNewCol = function(name, className) {
//        var row = document.createElement('tr');
//    }
}

function Column(name, className, txt, rise) {
    this.name = name;
    this.className = className;
    this.txt = txt;
    this.rise = rise;
    this.changeRise = function() {
        
        if (this.rise) 
            this.txt =  ' <span>&#9650;</span>';
        else
            this.txt =  ' <span>&#9660;</span>';
        
        this.rise = !this.rise;
        
//        if (this.txt == ' <span>&#9650;</span>')
//            this.txt =  ' <span>&#9660;</span>';
//        else
//            this.txt =  ' <span>&#9650;</span>';
    }
//        this.setText = function() {
//            (this.order) ? this.txt = this.name + ' <span>&#9650;</span>' : this.txt = this.name + ' <span>&#9660;</span>';
//        }
}

function sortCollection(collection, parameter) {

    collection.sort(compare);

    // функция сравнения
    function compare(a, b) {
        if (parameter === 'id') {
            return a[parameter] - b[parameter];
                
        } else {
            //                if (a[parameter] == b[parameter]) con('aaa');
            if (a[parameter] > b[parameter]) return 1;
            if (a[parameter] < b[parameter]) return -1;
        }
    }        

}

function check(collection, parameter) {

    for (var i = 0; i < collection.length; i++) {

        var arr = [];
//            var paramIndex = 0;

        function sortSameData(collection, parameter) {

            while (collection[i + 1][parameter] == collection[i][parameter]) {

                arr.push(collection[i]);
                con('i : ' + i + ', col[i] : ' + collection[i][parameter]);
                i++;
            }

            for (var j = 0; j < columns.length; j++) {
//                        var param = columns[j].id;
                if (columns[j].id == parameter) continue;
                sortCollection(arr, columns[j].id);
//                    sortSameData(arr, );

            }
        }
//            con('arr : ' + arr);
    }        
}

//    function Contact() {
//        this.name = 
//    }

// вывод информации о ходе выполнения программы
function con(msg) {
    console.log(msg);
}


    
