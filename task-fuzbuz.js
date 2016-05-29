"use strict";
console.clear();

(w => {
    // Yor code here ...
//    Ваш код реализации функции dscount

    function dscount(str, symbolA, symbolB) {

        // функция dscount возвращает число идущих подряд символов symbolA и symbolB в строке str, без учёта регистра
        var count = 0;

        // сбрасываем входные строки в нижний регистр (регистр не должен учитываться)
        var s = str.toLowerCase();
        var a = symbolA.toLowerCase();
        var b = symbolB.toLowerCase();
        
        var substr = a + b;        
        
        // поиск всех вхождений
        var index = -1;
        
        while ((index = s.indexOf(substr, index + 1)) != -1) {
            count++;
        }

        return count;

    }
    // ... //

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