const loginUrl = "https://script.google.com/macros/s/AKfycbyW3tAarHX5jOT6p4nRfHhjxVnLrOpUhtSEo7virjvqlrNjHDLZNH9IO1F5aqJ1E-GB-w/exec";
async function adbLogin(type = "all", obj) {
  try {
    if (type == "get") {
      const response = await fetch(loginUrl + "?t=get&p=" + obj.password);
      if (!response.ok) {
        throw new Error(response.status + "\n" + response.statusText);
      }
      const json = await response.json();
      if (json.ans.state == "success") {
        return new Promise(resolve => resolve(json.ans));
      } else {
        throw new Error(json.ans.value);
      }
    } else if (type == "set") {
      if (!("getItem" in obj || "setItem" in obj)) {
        throw new Error("getItem or setItem");
      }
      let url = loginUrl + "?t=set&i=" + obj.userId;
      if ("getItem" in obj) { url += "&g=" + JSON.stringify(obj.getItem); }
      if ("setItem" in obj) { url += "&s=" + JSON.stringify(obj.setItem); }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(response.status + "\n" + response.statusText);
      }
      const json = await response.json();
      if (json.ans.state == "success") {
        return new Promise(resolve => resolve(json.ans));
      } else {
        throw new Error(json.ans.value);
      }
    } else if (type == "all") {
      const response = await fetch(loginUrl + "?t=all&g=" + JSON.stringify(obj.getItem));
      if (!response.ok) {
        throw new Error(response.status + "\n" + response.statusText);
      }
      const json = await response.json();
      if (json.ans.state == "success") {
        return new Promise(resolve => resolve(json.ans));
      } else {
        throw new Error(json.ans.value);
      }
    } else { throw new Error("none"); }
  } catch (error) {
    return new Promise((r, reject) => reject(error));
  }
}

/*
type get パスワードからユーザーIDを取得する
  obj = {
    password: password,
      // passwordに一致するユーザーIDを取得
      // userId
  }
  必須 password
type set 内容を書き換える(userId必須)
  obj = {
    userId: userId
      // 上で取得したIDが必須
    getItem: [["a","b"],["a","b","c"]],
      // userIdが一致しているxxx.a.bとxxx.a.b.cのvalueを配列で順に取得
      // [value, value]
    setItem: [[["a","b"],"hello"],[["a","b","c"],"nice"]],
      // userIdが一致しているxxx.a.bに"hello"，xxx.a.b.cに"nice"をvalueに代入
  }
  必須 userId
  最低一つ必須 getItem setItem
type all 内容を取得する
  obj = {
    getItem: [["a","b"],["a","b","c"]],
      // xxx.a.bとxxx.a.b.cそれぞれで全ての子要素を含むvalueとuserNameを配列で順に取得
      // [{user: userName, value: value}, {user: userName, value: value}]
  }
  必須 getItem
*/