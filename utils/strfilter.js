module.exports = function(str){
    var newStr = str.replace(/\"/g,`\\"`);
    newStr = newStr.replace(/\'/g,"\\'");
    return newStr;
}