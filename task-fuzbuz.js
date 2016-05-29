"use strict";
console.clear();

(w => {
    // Yor code here ...

    var s = 'AB___ab__';

    function dscount(str, symbolA, symbolB) {

        // функция dscount возвращает число идущих подряд символов symbolA и symbolB в строке str, без учёта регистра

        // сбрасываем входные строки в нижний регистр (регистр не должен учитываться)
        var s = str.toLowerCase();
        var a = symbolA.toLowerCase();
        var b = symbolB.toLowerCase();
        
        var substr = a + b;
        var count = 0;
        
        var index = -1;
        
        // поиск всех вхождений
        while ((index = s.indexOf(substr, index + 1)) != -1) {
//        while (index != s.length) {
            
//            index++;
            count++;
        }
        
//        while (true) {
//          var foundPos = str.indexOf(target, pos);
//          if (foundPos == -1) break;
//
//          alert( foundPos ); // нашли на этой позиции
//          pos = foundPos + 1; // продолжить поиск со следующей
//        }

        return s;

    }
//            Ваш код реализации функции dscount
    // ... //

    var strlow = dscount(s, 'a', 'b');
//            console.log('str : ' + dscount('ab___ab__', 'a', 'b'));


    // Для удобства можно использовать эти тесты:
    try {
        test(dscount, ['ab___ab__', 'a', 'b'], 2);
        test(dscount, ['___cd____', 'c', 'd'], 1);
        test(dscount, ['de_______', 'd', 'e'], 1);
        test(dscount, ['12_12__12', '1', '2'], 3);
        test(dscount, ['_ba______', 'a', 'b'], 0);
        test(dscount, ['_a__b____', 'a', 'b'], 0);
        test(dscount, ['-ab-аb-ab', 'a', 'b'], 2);

        console.info("Congratulations! All tests success passed.");
    } catch(e) {
        console.error(e);
    }

    // Простая функция тестирования
    function test(call, args, count, n) {
        let r = (call.apply(n, args) === count);
        console.assert(r, `Finded items count: ${count}`);
        if (!r) throw "Test failed!";
    }

    return '--- End ---';
})(window); 