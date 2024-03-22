//il contratto creato viene assegnato alla variabile 'Votazione'
var Votazione = artifacts.require("./Votazione.sol");

//viene aggiunto agli altri contratti caricati
module.exports = function(deployer) {
  deployer.deploy(Votazione);
};
