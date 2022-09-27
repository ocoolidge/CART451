module.exports.name = function() {
    return "Sabine";
}

module.exports.setPetName = function(inComing) {
    petName = inComing;
    appendPetName();
}
     
module.exports.getPetName = function() {
    return petName;
}
     
    /** private **/
function appendPetName(){
    petName = petName +"****";
}