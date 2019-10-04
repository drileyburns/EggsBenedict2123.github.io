"use strict";

let depthValue = 0;
let previousLetter = '';
let tempWord = '';
let foundCopy = false;
let currentLog = document.getElementById('search_log');

class LetterNode {
  constructor(letter) {
    this.data = letter;
    this.pos = depthValue;
    this.parent = null;
    this.children = [];
    this.final = false;
  }
}

class WordTree {
  constructor() {
    this.roots = [];
  }

  addLetter(letter) {
    if (!letter.match(/[a-zA-Z]/i)) return;
    currentLog.innerHTML = "";

    foundCopy = false;
    let newLetter = new LetterNode(letter);

    if (previousLetter === '') previousLetter = letter;
    tempWord = tempWord + letter;
    depthValue++;

    if (newLetter.pos === 0) {
      if (this.roots.every(root => root.data !== newLetter.data)) {
        return this.roots.push(newLetter); 
      } else {
        let rootQueue = this.roots.reduce((arr, x) => {
          if (x.data === newLetter.data) arr.push(x);
          return arr;
        }, []);
        foundCopy = true; //testing
        return this.searchForFinals(...rootQueue);
      }
    }

    newLetter.parent = previousLetter;
    previousLetter = letter;

    this.appendData(this.roots, newLetter);
  }

  appendData(key, node, k = 0) {

    if (Object.is(key, this.roots)) {
      for (let root of key) {
        if (root.pos === node.pos - 1 && root.data === node.parent) {

          if (root.children.every(x => x.data !== node.data)) {
            return root.children.push(node);
          }
        }
        if (root.data.toLowerCase() === tempWord.toLowerCase()[k]) {
          return this.appendData(root, node, k + 1);
        }
      }
    }
    if (key.pos === node.pos - 1 && key.data === node.parent) {

      if (key.children.some(x => x.data === node.data)) {

        let queue = key.children.reduce((arr, x) => {
          if (x.final === false && x.data === node.data) arr.push(x);
          return arr;
        }, []);
        return this.searchForFinals(...queue);

      } else return key.children.push(node);
    }
    if (key.children) {
      key.children.forEach(child => {

        if (child.data === tempWord.toLowerCase()[k]) {
          return this.appendData(child, node, k + 1);
        }
      });
    }
  }

  searchForFinals(node) {
    let found = [];
    let tempStr = tempWord;
    let arrDump = false;

    function dfs(obj, str = tempWord) {
      if (obj === undefined) return;

      if (obj.children.length > 1 && obj.pos === tempStr.length) {
        arrDump = true;
        tempStr = tempStr + obj.data;
      }
      for (let child of obj.children) {
        str = str + child.data;
        
        if (child.children.length > 0) {
          if (child.final === true) {
            found.push(' ' + str);
          }
          dfs(child, str);

        } else {
          found.push(' ' + str);
        }
        str = tempStr;
      }
      if (arrDump === true && obj.children[0].pos === tempStr.length) {
        arrDump = false;

        tempStr = tempStr.slice(0, -1);
        if (tempWord.length === 1) arrDump = true; //this line might be more crucial for other test cases down the line, keep an eye on it.
      }
    }
    dfs(node);

    if (found.length > 0) {
      foundCopy = true;
      return currentLog.innerHTML = `in ${tempWord}, possible words: ${found}`;
    } else return;
  }

  finishWord(word = tempWord) {

    function searchWithKey(key, searching, i = 0) {

      if (searching.data === key[i] && key[i + 1] === undefined) {
        return searching.final = true;
      }
      searching.children.forEach(child => {

        if (child.data === key[i + 1]) {
          searchWithKey(key, child, i + 1);
        }
      });
    }
    this.roots.forEach(root => {

      if (root.data === word[0]) {
        return searchWithKey(word, root);
      }
    });
    depthValue = 0;
    previousLetter = '';
    tempWord = '';
    document.getElementById('searcher').value = '';
    currentLog.innerHTML = "";
  }

  removeLetter(letter = previousLetter) {
    tempWord = tempWord.slice(0, -1);

    if (this.searchTree()) {
      previousLetter = tempWord.length > 0 ? tempWord[tempWord.length - 1] : '';
      return depthValue--;
    }

    function dfs(node, i = 1) {
      for (let k = 0; k < node.children.length; k++) {

        if (node.children[k].data === letter && node.children[k].pos === i) {
          depthValue--;
          previousLetter = tempWord[tempWord.length - 1];
          return node.children.splice(k, 1);
        }
        if (node.children[k].data === tempWord[i]) dfs(node.children[k], i + 1);
      }
    }
    for (let j = 0; j < this.roots.length; j++) {
      if (this.roots[j].data === tempWord[0]) {

        if (this.roots[j].children) return dfs(this.roots[j]);
        depthValue--;
        previousLetter = '';
        return this.roots.splice(j, 1);
      }
    }
  }
  searchTree() {
    let answer = false;

    function dfs(nodeArr, i = 0, letter = previousLetter) {
      for (let child of nodeArr) {

        if (child.data === tempWord[i]) {
          if (tempWord.length === 1 && foundCopy) return answer = true;
          dfs(child.children, i + 1);

        } else if (child.data === letter && child.pos === tempWord.length) {
          if (foundCopy) return answer = true;
        }
      }
    }
    dfs(this.roots);
    return answer;
  }

  visualSearch(nodeArr = this.roots, i = 0) {
    let answer;
    for (let child of nodeArr) {
      if (child.data === tempWord[i]) {
        if (i === tempWord.length - 1) {
          answer = nodeArr;
        } else return this.visualSearch(child.children, i + 1);
      }
    }
    return answer;
  }
}
let tree = new WordTree;


//Listening to typing here.
function examine(val) {
  if (tempWord.length >= val.length) return tree.removeLetter();
  let letter = val.slice(-1);
  tree.addLetter(letter);
  buildVisualTree(letter);
}
//so you can hit 'enter' to add data.
let typingSend = document.getElementById('searcher');
typingSend.addEventListener("keyup", (event) => {
  if (event.keyCode === 13 && typingSend.value.length > 0) {
    document.getElementById('submit').click();
  }
});


//Here is where the visual portion is built.
function buildVisualTree(letter) {
    const div = tree.visualSearch().find(x => x.data === letter);

    const rootCheck = document.getElementById('rootContainer');
    if (!rootCheck) {

      let rootContainer = document.createElement("div");
      rootContainer.id = 'rootContainer';
      document.getElementById('tree_container').appendChild(rootContainer);
    }
    if(tempWord.length === 1 && !tree.searchTree()) {
      let rootDiv = document.createElement("div");
      let rootText = document.createElement("p");

      rootDiv.id = div.data.toLowerCase();
      rootDiv.classList.add('result');

      rootDiv.appendChild(rootText);
      rootText.innerHTML = div.data;
      rootText.style.margin = "25% 0";

      document.getElementById('rootContainer').appendChild(rootDiv);
      setTimeout(() => rootDiv.classList.add('animate'), 1);
    }

    function buildNext(objArr, letter) {
      let nextNextDivData = [];

      function pushData(nodeArr, i = div.pos + 2, parent) {
        if (nodeArr === undefined) return;
        let newDiv = [];

        for (let node of nodeArr) {
          newDiv.push(node.data);
          pushData(node.children, i + 1, node.data);
        }
        newDiv.push(`POS: {${i}}`) //temp, just to help me visualize this 
        newDiv.push(i);

        if (newDiv.length > 2) { //will go back to 1 later
          if (parent === undefined) parent = letter;

          newDiv.unshift(`PARENT: (${parent})`); //temp, just to help me visualize this 
          nextNextDivData.push(newDiv);
        }
      }
      pushData(objArr);
      nextNextDivData = nextNextDivData.sort((a, b) => a[a.length - 1] - b[b.length - 1]).map(x => x.slice(0, x.length - 1));

      //console.log(nextNextDivData); //here is all of our data, now use it to BUILD THAT (tree) WALL
    }
    let nextDiv = [];
    for (let child of div.children) {
      nextDiv.push(child.data);

      if (child.children.length > 0) {
        buildNext(child.children, child.data);
      }
    }
}