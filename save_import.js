"use strict";

//----- Класс сохранения и открытия файлов
class AJAXStorage {

    constructor(varName, updList, disBtns, enBtns) {

        let self = this;
        self.varName = varName;
        self.storage = {};
        self.updList = updList;
        self.disBtns = disBtns;
        self.enBtns = enBtns;

        function restoreInfo() {
            $.ajax(
                {
                    url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
                    data : { f : 'READ', n : varName },
                    success : readReady, error : errorHandler, complete: updList
                }
            );
        }

        function readReady(callresult) {
            if ( callresult.error!=undefined )
                console.log(callresult.error);
            else if ( callresult.result!="" ) {
                self.storage = JSON.parse(callresult.result);
            }
        }
        restoreInfo();
    }

    addValue(key, value) {
       
        let self = this;
        if (key in self.storage) {
            repeatName = true;
        }
        self.storage[key] = value;
        
        function storeInfo() {
            updatePassword=Math.random();
            $.ajax( {
                    url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
                    data : { f : 'LOCKGET', n : self.varName, p : updatePassword },
                    success : lockGetReady, error : errorHandler, complete: self.updList
                }
            );

        }

        function lockGetReady(callresult) {

            if ( callresult.error != undefined )
                console.log(callresult.error);
            else {
                let storage = self.storage;
                $.ajax( {
                        url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
                        data : { f : 'UPDATE', n : self.varName, v : JSON.stringify(storage), p : updatePassword },
                        success : updateReady, error : errorHandler
                    }
                );
            }

        }

        function updateReady(callresult) {
            
            if ( callresult.error != undefined )
                console.log(callresult.error);

        }
        storeInfo();

    }

    getValue(key) {

        if (key in this.storage) {
            return this.storage[key];
        } else {
            return undefined;
        }

    }

    deleteValue(key) {

        let self = this;

        if (key in self.storage) {

            delete self.storage[key];

            function storeInfo() {
                updatePassword = Math.random();
                $.ajax( {
                        url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
                        data : { f : 'LOCKGET', n : self.varName, p : updatePassword },
                        success : lockGetReady, error : errorHandler,
                        beforeSend : self.disBtns, complete : self.enBtns
                    }
                );
            }

            function lockGetReady(callresult) {

                if ( callresult.error != undefined )
                    console.log(callresult.error);
                else {
                    let storage = self.storage;
                    $.ajax( {
                            url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
                            data : { f : 'UPDATE', n : self.varName, v : JSON.stringify(storage), p : updatePassword },
                            success : updateReady, error : errorHandler,
                        }
                    );
                }

            }

            function updateReady(callresult) {

                if ( callresult.error != undefined )
                    console.log(callresult.error);

            }
            storeInfo();
            return true;
        } else {
            return false;
        }
    }

    getKeys() {

        return Object.keys(this.storage);

    }
}