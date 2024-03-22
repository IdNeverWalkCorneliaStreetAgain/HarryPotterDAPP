//il contratto creato viene assegnato alla variabile 'Votazione'
var Votazione = artifacts.require("./Votazione.sol");

/*la variabile 'accounts' rappresenta tutti gli account forniti da Ganache.
lista di tutti i test da eseguire */
contract("Votazione", function(accounts){
  var votazione;
  
  it("Il contratto è inizializzato con il corretto numero di casate", function() {
    return Votazione.deployed().then(function(instance) {
      return instance.casateCount();
    }).then(function(count) {
      assert.equal(count, 4);
    });
  });
  it("Le casate sono state inizializzate correttamente", function() {
    return Votazione.deployed().then(function(instance) {
      votazione = instance;
      return votazione.casate(1);
    }).then(function(casata) {
      assert.equal(casata[0], 1, "id corretto");
      assert.equal(casata[1], "Grifondoro", "nome corretto");
      assert.equal(casata[2], 0, "numero voti corretto");
      return votazione.casate(2);
    }).then(function(casata) {
      assert.equal(casata[0], 2, "id corretto");
      assert.equal(casata[1], "Serpeverde", "nome corretto");
      assert.equal(casata[2], 0, "numero voti corretto");
      return votazione.casate(3);
    }).then(function(casata) {
      assert.equal(casata[0], 3, "id corretto");
      assert.equal(casata[1], "Tassorosso", "nome corretto");
      assert.equal(casata[2], 0, "numero voti corretto");
      return votazione.casate(4);
    }).then(function(casata) {
      assert.equal(casata[0], 4, "id corretto");
      assert.equal(casata[1], "Corvonero", "nome corretto");
      assert.equal(casata[2], 0, "numero voti corretto");
    });
  });
  it("L'account corrente è riuscito a votare", function() {
    return Votazione.deployed().then(function(instance) {
      votazione = instance;
      casataId = 1;
      return votazione.voto(casataId, { from: accounts[0] });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "si è verificato un evento");
      assert.equal(receipt.logs[0].event, "votoEvent", "il tipo di evento è corretto");
      assert.equal(receipt.logs[0].args._casataId.toNumber(), casataId, "l'id della casata è corretto");
      return votazione.votanti(accounts[0]);
    }).then(function(voted) {
      assert(voted, "l'elettore ha votato");
      return votazione.casate(casataId);
    }).then(function(casata) {
      var nvoti = casata[2];
      assert.equal(nvoti, 1, "incremento il numero di voti della casata");
    })
  });
  it("Viene lanciata un'eccezione per casate non valide", function() {
    return Votazione.deployed().then(function(instance) {
      votazione = instance;
      return votazione.voto(99, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return votazione.casate(1);
    }).then(function(casata1) {
      var nvoti = casata1[2];
      assert.equal(nvoti, 1, "Grifondoro non ha ricevuto alcun voto");
      return votazione.casate(2);
    }).then(function(casata2) {
      var nvoti = casata2[2];
      assert.equal(nvoti, 0, "Serpeverde non ha ricevuto alcun voto");
      return votazione.casate(3);
    }).then(function(casata3) {
      var nvoti = casata3[2];
      assert.equal(nvoti, 0, "Tassorosso non ha ricevuto alcun voto");
      return votazione.casate(4);
    }).then(function(casata4) {
      var nvoti = casata4[2];
      assert.equal(nvoti, 0, "Corvonero non ha ricevuto alcun voto");
    });
  });
  it("Viene lanciata un'eccezione per il doppio voto da parte dello stesso account", function() {
    return Votazione.deployed().then(function(instance) {
      votazione = instance;
      casataId = 2;
      votazione.voto(casataId, { from: accounts[1] });
      return votazione.casate(casataId);
    }).then(function(casata) {
      var nvoti = casata[2];
      assert.equal(nvoti, 1, "primo voto accettato");
      return votazione.voto(casataId, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) {
      assert(error.message, "error message must contain revert");
      return votazione.casate(1);
    }).then(function(casata1) {
      var nvoti = casata1[2];
      assert.equal(nvoti, 1, "Grifondoro non ha ricevuto alcun voto");
      return votazione.casate(2);
    }).then(function(casata2) {
      var nvoti = casata2[2];
      assert.equal(nvoti, 1, "Serpeverde non ha ricevuto alcun voto");
      return votazione.casate(3);
    }).then(function(casata3) {
      var nvoti = casata3[2];
      assert.equal(nvoti, 0, "Tassorosso non ha ricevuto alcun voto");
      return votazione.casate(4);
    }).then(function(casata4) {
      var nvoti = casata4[2];
      assert.equal(nvoti, 0, "Corvonero non ha ricevuto alcun voto");
    });
  });
});
