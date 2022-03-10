const adb = {};
(() => {
  let db;
  let dbObject;
  const db_name = "adyobe";
  const objectStore_name = "config";
  const objStore_keyPath = "id";
  function error_function(event, reject = () => { }, name = "") {
    if (name?.length > 0) {
      console.log("error", name, event);
    } else {
      console.log("error", event);
    }
    reject(event);
  }
  function errorFunctionCreate(reject = () => { }, name) {
    return function (event) {
      return error_function(event, reject, name);
    };
  }
  function openIDB(dbName = db_name, objectStoreName = objectStore_name, objStoreKeyPath = objStore_keyPath) {
    return new Promise((resolve, reject) => {
      try {
        const myIDB = indexedDB.open(dbName);
        myIDB.onupgradeneeded = function (event) {
          db = event.target.result;
          db.onerror = errorFunctionCreate(reject, "onupgradeneeded");
          if (!db.objectStoreNames.contains(objectStoreName)) {
            const obj = db.createObjectStore(objectStoreName, {
              keyPath: objStoreKeyPath,
            });
            console.log("createObjectStore", obj);
          }
        }
        myIDB.onsuccess = function (event) {
          console.log("success myIDB", event);
          resolve(db = event.target.result);
        }
        myIDB.onerror = errorFunctionCreate(reject, "open");
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }
  function getObjectStore(dbName = db_name, objectStoreName = objectStore_name, readType = "readwrite") {
    return new Promise(async (resolve, reject) => {
      try {
        db ?? (await openIDB(dbName, objectStoreName));
        const transaction = db.transaction(objectStoreName, readType);
        transaction.oncomplete = function (event) {
          console.log("complete transaction", event);
        };
        transaction.onerror = errorFunctionCreate(reject, "transaction");
        const objectStore = transaction.objectStore(objectStoreName);
        resolve(objectStore);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }
  function getObjectStoreValue(dbName = db_name, objectStoreName = objectStore_name, objStoreId) {
    return new Promise(async (resolve, reject) => {
      try {
        const objectStore = await getObjectStore(dbName, objectStoreName, "readonly");
        const request = ((typeof objStoreId === "undefined" || objStoreId.length === 0) ? (objectStore.getAll()) : (objectStore.get(objStoreId)));
        request.onsuccess = function (event) {
          const result = event.target.result;
          resolve(result);
        }
        request.onerror = errorFunctionCreate(reject, "request");
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }
  (async () => {
    try {
      dbObject = await getObjectStoreValue();
    } catch (error) {
      console.log(error);
    }
  })();
  function setObjectStoreValue(dbName = db_name, objectStoreName = objectStore_name, obj = {}, isOver = true) {
    return new Promise(async (resolve, reject) => {
      try {
        const objectStore = await getObjectStore(dbName, objectStoreName, "readwrite");
        if (objStore_keyPath in obj) {
          const request = objectStore.getAllKeys();
          request.onsuccess = function (event) {
            const result = event.target.result;
            obj[objStore_keyPath] = result.filter(e => /^\d+$/.test(e)).map(e => parseInt(e)).sort((a, b) => b - a)[0] + 1;
          }
          request.onerror = errorFunctionCreate(reject, "request");
        }
        const request = (isOver ? objectStore.put(obj) : objectStore.add(obj));
        request.onsuccess = function (event) {
          resolve(event);
        }
        request.onerror = errorFunctionCreate(reject, "request");
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  Object.defineProperties(adb, {
    isElement: {// HTML要素かどうかを判定します。
      value: function (obj) {
        try {
          return obj instanceof HTMLElement;
        }
        catch (error) {
          console.log(error);
          return (typeof obj === "object") && (obj.nodeType === 1) && (typeof obj.style === "object") && (typeof obj.ownerDocument === "object");
        }
      },
      writable: false,
      configurable: false,
      enumerable: true,
    },
    factorial: {// 階乗を計算します。BigIntで返します。
      value: function (number = 0) {
        if (typeof number === "bigint") {
          if (number <= 0n) { number = 1n; }
        } else if (Number.isInteger(number) && number > 0) {
          number = BigInt(number);
        } else { number = 1n; }
        let counter = 1n;
        for (let i = 2n; i <= number; i++) { counter *= i; }
        return counter;
      },
      writable: false,
      configurable: false,
      enumerable: true,
    },
    primeSort: {// 入力以下の素数を列挙します。結果は都度保存され、過去を含めた全ての入力での最大値で計算します。
      value: (() => {
        let primeArray = [2];
        return function (number = 1) {
          if (Number.isInteger(number) && number > primeArray[primeArray.length - 1]) {
            let start = primeArray[primeArray.length - 1] + 1;
            let end = number + 1;
            for (let i = start; i < end; i++) {
              const sqrt = Math.floor(Math.sqrt(i));
              let isPrime = true;
              for (let j = 0; j < primeArray.length; j++) {
                const prime = primeArray[j];
                if (sqrt < prime) { break; }
                isPrime = i % prime != 0;
                if (!isPrime) { break; }
              }
              if (isPrime) { primeArray.push(i); }
            }
          }
          return primeArray;
        }
      })(),
      writable: false,
      configurable: false,
      enumerable: false,
    },
    isPrime: {// 入力が素数かどうかを判定します。PrimeSortを使用します。
      value: function (number = 1) {
        if (Number.isInteger(number) && number > 1) {
          const arr = this.primeSort(number);
          let isPrime = false;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i] > number) { break; }
            isPrime = arr[i] == number;
            if (isPrime == true) { break; }
          }
          return isPrime;
        } else {
          return false;
        }
      },
      writable: false,
      configurable: false,
      enumerable: false,
    },
    primeList: {// 入力以下の素数を列挙します。PrimeSortとPrimeCountingを使用します。
      value: function (number = 1) {
        return this.primeSort().slice(0, this.primeCounting(number));
      },
      writable: false,
      configurable: false,
      enumerable: false,
    },
    primeCounting: {// 入力以下の素数の個数を計算します。PrimeSortを使用します。
      value: function (number = 1) {
        let arr = this.primeSort(number);
        let i = arr.length;
        while (i-- > 0) { if (arr[i] <= number) { break; } }
        return i + 1;
      },
      writable: false,
      configurable: false,
      enumerable: true,
    },
    zeroNegaPosi: {// 入力が正のゼロなのか負のゼロなのかを判定します。
      value: function (number) {
        if (Number.isInteger(number) && number === 0) {
          return (new Uint8Array(new Float32Array([number]).buffer)[3] === 0) ? "positive" : "negative";
        } else {
          return "not zero";
        }
      },
      writable: false,
      configurable: false,
      enumerable: true,
    },
    getIdb: {
      value: function (objStoreId = "") {
        return new Promise(async (resolve, reject) => {
          try {
            let arr = await getObjectStoreValue(db_name, objectStore_name, objStoreId);
            dbObject = {};
            for (let i = 0; i < arr?.length; i++) {
              const ele = arr[i];
              dbObject[ele[objStore_keyPath]] = Object.fromEntries(Object.entries(ele).filter(e => e[0] != objStore_keyPath));;
            }
            resolve(dbObject);
          } catch (error) {
            reject(error);
          }
        });
      },
      writable: false,
      configurable: false,
      enumerable: true,
    },
    setIdb: {
      value: function (obj = { [objStore_keyPath]: 0 }, isOver = true) {
        return new Promise(async (resolve, reject) => {
          try {
            const res = await setObjectStoreValue(db_name, objectStore_name, obj, isOver);
            resolve(res);
          } catch (error) {
            reject(error);
          }
        });
      },
      writable: false,
      configurable: false,
      enumerable: true,
    },
  });

  Object.defineProperties(Array.prototype, {
    last: {// 配列の最後の要素を返します。
      get() { return this[this.length - 1]; },
      set(value) { return this[this.length - 1] = value; },
      configurable: false,
      enumerable: false,
    },
    shuffle: {// 配列の要素をシャッフルします。破壊的か非破壊的かを選べます。
      value: function (change = false) {
        let array = change ? this : [...this];
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      },
      writable: false,
      configurable: false,
      enumerable: false,
    },
    chunk: {// 配列の要素を決められた要素数ごとに区切ります。余りは最後にまとめられます。破壊的か非破壊的かを選べます。
      value: function (size = 1, change = false) {
        let array = change ? this : [...this];
        let length = Math.ceil(array.length / size);
        for (let i = 0; i < length; i++) {
          array.splice(i, 0, array.splice(i, size));
        }
        return array;
      },
      writable: false,
      configurable: false,
      enumerable: false,
    }
  });

  Object.defineProperties(Object.prototype, {
    length: {// オブジェクトのkeyの個数を返します。
      get() { return Object.keys(this).length; },
      configurable: false,
      enumerable: false,
    }
  });
})();