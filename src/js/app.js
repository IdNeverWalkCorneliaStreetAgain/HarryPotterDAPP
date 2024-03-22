App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function () {
    return App.initWeb3();
  },
/*web3 è una libreria javascript che permette la comunicazione app client-side
con la blockchain*/
  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      //se viene già fornita un'istanza web3 da Meta Mask.
      const ethEnabled = () => {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          return true;
        }
        return false;
      };
      if (!ethEnabled()) {
        alert(
          'Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!'
        );
      }
      web3 = window.web3;
      App.web3Provider = web3.currentProvider;
    } else {
      //se l'istanza web3 non c'è, specifico quella di default
      App.web3Provider = new Web3.providers.HttpProvider(
        'http://localhost:7545'
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON('Votazione.json', function (voting) {
      /*recuperiamo il file artifact per il nostro smart contract e lo istanziamo attraverso la libreria truffle/contract*/
      App.contracts.Votazione = TruffleContract(voting);
      
      //settiamo il provider per il nostro contratto
      App.contracts.Votazione.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  //rimane in ascolto degli eventi generati nel contratto
  listenForEvents: function () {
    App.contracts.Votazione.deployed().then(function (instance) {
      instance.votoEvent({}, {
            fromBlock: 0,
            toBlock: 'latest',
          }
        )
        .watch(function (error, event) {
          console.log('event triggered', event);
          //ricarica quando viene registrato un nuovo voto
          App.render();
        });
    });
  },

  render: async () => {
    var votazione;
    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    //carica i dati dell'account
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      App.account = accounts[0];
      $('#accountAddress').html('Il tuo account: ' + App.account);
    } catch (error) {
      if (error.code === 4001) {
        //richiesta dell'utente rifiutata
      }
      console.log(error);
    }

    //carica i dati del contratto
    App.contracts.Votazione.deployed().then(function (instance) {
        votazione = instance;
        return votazione.casateCount();
      }).then(async (casateCount) => {
        const promise = [];
        for (var i = 1; i <= casateCount; i++) {
          promise.push(votazione.casate(i));
        }

        const casate = await Promise.all(promise);
        var casateResults = $('#casateResults');
        casateResults.empty();

        var casateSelect = $('#casateSelect');
        casateSelect.empty();

        for (var i = 0; i < casateCount; i++) {
          var id = casate[i][0];
          var nome = casate[i][1];
          var nvoti = casate[i][2];

          // costituzione della casata
          var casataTemplate =
            '<tr><th>' +
            id +
            '</th><td>' +
            nome +
            '</td><td>' +
            nvoti +
            '</td></tr>';
          casateResults.append(casataTemplate);

          var casataOption =
            "<option value='" + id + "' >" + nome + '</ option>';
          casateSelect.append(casataOption);
        }
        return votazione.votanti(App.account);
      })
      .then(function (hasVoted) {
        //se l'utente ha già votato
        if (hasVoted) {
          $('form').hide();
        }
        loader.hide();
        content.show();
      })
      .catch(function (error) {
        console.warn(error);
      });
  },

  castVote: function () {
    var casataId = $('#casateSelect').val();
    App.contracts.Votazione.deployed().then(function (instance) {
        return instance.voto(casataId, { from: App.account });
      }).then(function (result) {
        //attende che i voti vengano ricaricati
        $('#content').hide();
        $('#loader').show();
      }).catch(function (err) {
        console.error(err);
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
