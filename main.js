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

var rowMax = 20; // число отображаемых строк таблицы
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
    columns.push(new Column('id'       , 'small-col' , ' <span>&#9650;</span>'));
    columns.push(new Column('firstName', 'normal-col', ' <span>&#9650;</span>'));
    columns.push(new Column('lastName' , 'normal-col', ' <span>&#9650;</span>'));
    columns.push(new Column('email'    , 'large-col' , ' <span>&#9650;</span>'));
    columns.push(new Column('phone'    , 'big-col'   , ' <span>&#9650;</span>'));

    // новая таблица
    var tblId = 'table';        
    var table = new Table(tblId, columns);
    table.display(false);

    // создаем верхнюю строку
    table.addNewRow('top-row smooth-hover');        

    // заполняем верхнюю строку        
    var colNames = [];

    for (var i = 0; i < columns.length; i++) {            
        colNames[i] = columns[i].name + columns[i].txt;
    }

    table.fillRowData(0, colNames);

    // запрашиваем данные с сервера
    $.getJSON(url, function(data) {

        con('данные получены');
        contacts = data.slice(); // копия загруженных данных

//            console.log('contacts.length : ' + contacts.length);
//            console.log('contacts[0] : ' + contacts[0]);
//            var mail = contacts[0].adress.city;

        sortCollection(contacts, 'id');
//            check(contacts, 'id');

//            con('contacts : ' + contacts);


        var l = data.length;

        if (l <= rowMax) {

            fillRows(table, contacts, l);
            con('контактов : ' + l + ' не больше ' + rowMax + ', навигация по страницам не нужна');

        } else {

            fillRows(table, contacts, rowMax);
            con('контактов : ' + l + ' больше ' + rowMax + ', делаю навигацию по страницам');
        }




        // скрываем анимацию загрузки
        con('скрываю анимацию');
//            displayLoader(false); // вариант без минимальной задержки
//            table.display(true);
        setTimeout(function () {
            displayLoader(false);
            table.display(true);
            showNavigationButtons(page, rowMax, l);
        }, 1000); // 1000 ms - минимальное время анимации



    });

    function fillRows(table, data, rowsNumber) {

        for (var i = 0; i < rowsNumber; i++) {
            table.addNewRow('');
            var colData = [];

            colData.push(data[i].id);
            colData.push(data[i].firstName);
            colData.push(data[i].lastName);
            colData.push(data[i].email);
            colData.push(data[i].phone);

            table.fillRowData(i+1, colData);
        }                
    }

    function displayLoader(flag) {
        
        // показать/скрыть анимацию загрузки данных
        // вариант с visibility работает быстрее варианта с display
//        (flag) ? $('#loader')[0].style.display = 'block' : $('#loader')[0].style.display = 'none';
        (flag) ? $('#loader')[0].style.visibility = 'visible' : $('#loader')[0].style.visibility = '';
    }

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

//        this.col = {
//            index : 0,
//            classes : []
//        };

//        this.row = {
//            index : 0,
//            classes : [],
//            top : false
//        };
//        var table = $('#' + tblId)

    this.setWidth = function(w) {
        if (w) this.table.style.width = w + 'px';
    }

    this.display = function(flag) {
        (flag) ? this.table.style.display = 'block' : this.table.style.display = 'none';
    }        

    this.addNewRow = function(rowClassName) {

        var self = this;
        var row = document.createElement('tr');
//            if (topFlag) this.rows.push(row);
        this.rows.push(row);
        if (rowClassName) row.className = rowClassName;
        self.table.appendChild(row);

        var w = 0;

        for (var i = 0; i < columns.length; i++) {
            var cell = document.createElement('td');
//                if (cellClassName) cell.className = cellClassName;
            cell.className = columns[i].className;
//                cell.innerHTML = columns[i];
            row.appendChild(cell);
            w += parseFloat(getComputedStyle(cell).width);
        }

        self.setWidth(w);

    };

    this.fillRowData = function(rowIndex, data) {
        var row = this.rows[rowIndex];

        var cells = row.getElementsByTagName('td');

        for (var i = 0; i < cells.length; i++) {
            cells[i].innerHTML = data[i];
        }

//            for (var i = 0; i < colNames.length; i++) {
//                var cell = document.createElement('td');
//                cell.className = colClasses[i];
//                cell.innerHTML = colNames[i];
//                row.appendChild(cell);
//                w += parseFloat(getComputedStyle(cell).width);
//            }            

    }

    this.addNewCol = function(name, className) {
        var row = document.createElement('tr');


    }



//        this.createCell = function(name, index, cellClasses) {
//            
//        };
}

//    function Row(index, colClasses) {
//        this.index = index,
//        this.colClasses = colClasses,
//            
//        this.addToTable = function(table) {
//            var row = document.createElement('tr');
//            (topFlag) ? row.className = classesTop : row.className = classes;
//        }    
//    }

//    function Col(tbl, name, index, classes) {
//        this.tbl = tbl;
//        this.name = name;
//        this.index = index;
//        this.classes = classes;
//    }

function Column(name, className, txt) {
    this.name = name;
    this.className = className;
//        this.order = 1;
    this.txt = txt;

//        this.setText = function() {
//            (this.order) ? this.txt = this.name + ' <span>&#9650;</span>' : this.txt = this.name + ' <span>&#9660;</span>';
//        }
}

function sortCollection(collection, parameter) {

//        if (parameter === 'id') {
        collection.sort(compare);


//            collection.sort(compareStrings);
//        } else {
//            collection.sort(compareStrings);
//        }

    // функция сравнения
    function compareStrings(a, b) {
//            var c = a;
//            var d = b;
        return a[parameter] - b[parameter];
    }

    function compare(a, b) {
        if (parameter === 'id') {
//                if (a[parameter] == b[parameter]) con('aaa');
            if (a[parameter] > b[parameter]) return 1;
            if (a[parameter] < b[parameter]) return -1;                
        } else {
            return a[parameter] - b[parameter];
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


    
