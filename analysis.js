var detective = require('detective');
var fs = require('fs');
var path = require('path');

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

var ReferNode = function(nodeName){
	this.nodeName = nodeName;
	this.requires = new Array();
}

var nodes=[];

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

function getNode(nodeName){
	for (var index = 0; index < onodes.length; index++) {
		var element = onodes[index];
		if(element.name==nodeName) return element;
	}
	return null;
}

function getOriginalNode(nodeName){
	for (var index = 0; index < nodes.length; index++) {
		var element = nodes[index];
		if(element.nodeName==nodeName) return element;
	}
	return null;
}

function getAbsPath(fileName, currentpath){
	return path.resolve(currentpath||__dirname, fileName);
}

function getRelativePath(fileName){
	return fileName.replace(__dirname, "");
}

getRequires(process.argv[2]);

function getRequires(filename, currentpath){
	var fullpath = getAbsPath(filename, currentpath);
	var node = getOriginalNode(getRelativePath(fullpath));
	if(node){
		console.log(fullpath+"~~~~~~~~");
		return;
	}
	console.log(fullpath);
	node = new ReferNode(getRelativePath(fullpath));
	if(!fs.existsSync(fullpath)){
		currentpath = currentpath || fullpath.replace(".js","");
		fullpath = path.resolve(currentpath, "index.js");
	}
	var src = fs.readFileSync(fullpath);
	var requires = detective(src);
	for(var i = 0; i < requires.length; i++){
		var fn = requires[i];
		if((fn.startsWith(".") || fn.startsWith("\\") || fn.startsWith("/")) && !fn.endsWith(".json")){
			if(!fn.endsWith(".js")) fn+=".js";
			getRequires(fn, currentpath);
			fn = getRelativePath(getAbsPath(filename, currentpath));
		}
		if(!fn.endsWith(".json")){
			node.requires.push(fn);
		}
	}
	
	nodes.push(node);
}

var onodes=[];
var links=[];

function pushNode(name){
	var node = getNode(name);
	if(!node){
		onodes.push({name:name, category:name.startsWith(".")?0:1,value:3});
	}
	else{
		node.value++;
	}
}

nodes.forEach(function(ele) {
	pushNode(ele.nodeName);
	ele.requires.forEach(function(req){
		pushNode(req);
		links.push({source:ele.nodeName, target:req})
	});
});

console.log(onodes);
console.log(links);

