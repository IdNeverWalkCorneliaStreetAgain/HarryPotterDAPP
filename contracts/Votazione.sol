pragma solidity >=0.4.22 <=0.8.12;

contract Votazione{
//Struttura di una casata
  struct Casata{
    uint id;
    string nome;
    uint nvoti;
  }
  
 //mapping per tenere traccia delle casate
   mapping(uint => Casata) public casate;
   
 //mapping per tenere traccia degli account che hanno votato
   mapping(address => bool) public votanti;
   
 //contatore per conoscere il n. di casate che partecipana alla votazione
   uint public casateCount;
   
 //dichiaro l'evento voto  
   event votoEvent(uint indexed _casataId);
   
 /*funzione per aggiungere nuove casate al mapping precedente
 è privata perchè la chiamata deve avvenire solo all'interno del contratto*/
    function addCasata(string memory _name) private {
      casateCount++;
      casate[casateCount] = Casata(casateCount, _name, 0);
    }
 //la funzione è pubblica perchè la chiamata deve avvenire da un account esterno
    function voto(uint _casataId) public {
        //richiede che non abbia già votato
        require(!votanti[msg.sender]);

        //richiede un casata valida
        require(_casataId > 0 && _casataId <= casateCount);

        //registra il voto dell'account corrente
        votanti[msg.sender] = true;

        //incrementa in numero di voti per la casata scelta
        casate[_casataId].nvoti++;

        //chiama l'evento
        emit votoEvent(_casataId);
    }
    
 //costruttore
    constructor() public {
      addCasata("Grifondoro");
      addCasata("Serpeverde");
      addCasata("Tassorosso");
      addCasata("Corvonero");
    }
  }
