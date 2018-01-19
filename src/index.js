import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //stores a snapshot of the board
      history: [{
        squares: Array(9).fill(null),
        position: [], 
      }],
      huPlayer: null,
      aiPlayer: null,
      stepNumber: 0,
      prepare: true,
    }
  } 

  // the main minimax funct   ion
  minimax(board, player) {
    let huPlayer = this.state.huPlayer;
    let aiPlayer = this.state.aiPlayer;
    //available spots
    var availSpots = emptyIndexies(board);
    // checks for the terminal states such as win, lose, and tie 
    
    // lose
    if (winning(board, huPlayer)){
      return {score:-10};
    }

    // win
    else if (winning(board, aiPlayer)){
      return {score:10};
    }

    // tie
    else if (availSpots.length === 0){
      return {score:0};
    }

    // an array to collect all the objects
    var moves = [];

    // loop through available spots
    for (var i = 0; i < availSpots.length; i++){
      //create an object for each and store the index of that spot 
      var move = {};
      move.index = board[availSpots[i]];

      // set the empty spot to the current player
      board[availSpots[i]] = player;

      /*collect the score resulted from calling minimax 
        on the opponent of the current player*/
      if (player === aiPlayer){
        let result = this.minimax(board, huPlayer);
        move.score = result.score;
      }
      else{
        let result = this.minimax(board, aiPlayer);
        move.score = result.score;
      }

      // reset the spot to empty
      board[availSpots[i]] = move.index;

      // push the object to the array
      moves.push(move);
    } 

    // if it is the computer's turn loop over the moves and choose the move with the highest score
    var bestMove;

    if(player === aiPlayer){
      let bestScore = -10000;
      for(let i = 0; i < moves.length; i++){
        if(moves[i].score > bestScore){
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else { 
    // else loop over the moves and choose the move with the lowest score
      let bestScore = 10000;
      for(let i = 0; i < moves.length; i++){
        if(moves[i].score < bestScore){
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    // return the chosen move (object) from the moves array
    return moves[bestMove];
  }

  handleClick(i) {
    // takes a copy of the history from the start until the selected step
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    // takes a copy of the current board
    const squares = current.squares.slice();
    const prepare = this.state.prepare;
    const position = current.position.slice();
    if (calculateWinner(squares) || squares[i] || prepare) {
      return;
    }
    // update the board with clicked square
    squares[i] = this.state.huPlayer;
    position[0] = numberToCoord(i)[0];  
    position[1] = numberToCoord(i)[1];
    
    if (this.state.stepNumber === 8) {
      this.setState({
      history: history.concat(
      [{
        squares: squares,
        position: position,
      }]),
      stepNumber: history.length,
    });   
      return;
    }
    // convert the board notation to use with minimax
    const newBoard = squares.map((el, index) => {if (el === null) {return index} else {return el}});
    let aiPlayer = this.state.aiPlayer;
    let bestMove = this.minimax(newBoard, aiPlayer); 

    // stop function call if there is a winner or game is in preparation phase
    if (calculateWinner(squares) || prepare) {
      return;
    }

    // take copy of the board and update it after human plays
    const aiSquares = squares.slice();
    aiSquares[bestMove.index] = aiPlayer;
    const aiPosition = position.slice();
    aiPosition[0] = numberToCoord(bestMove.index)[0];
    aiPosition[1] = numberToCoord(bestMove.index)[1];

    this.setState({
      history: history.concat(
      [{
        squares: squares,
        position: position,
      }], 
      [{
        squares: aiSquares, 
        position: aiPosition
      }]),
      stepNumber: history.length +1,
    });   
  }


  jumpTo(step) {
    this.setState({
      stepNumber: step
    });
  }

  chooseSide(player) {
    if (player === 'O') {
      this.setState({
        prepare: false,
        huPlayer: 'O',
        aiPlayer: 'X',
      }) 
    } else {
        this.setState({
        prepare: false,
        huPlayer: 'X',
        aiPlayer: 'O',
      })
    }
  }

  render() {
    // take a copy of the current state
    const history = this.state.history;
    const stepNumber = this.state.stepNumber;
    const current = history[stepNumber];
    const winner = calculateWinner(current.squares);
    const prepare = this.state.prepare;
    
    let status;
    if (winner) {
      current.squares.winSquares = winner[3];
      status = 'Winner: ' + winner[0];
    } else if (!winner && stepNumber === 9) {
      status = 'It"s a tie!';
    } else if (prepare) {
      status = <div><button onClick={() => this.chooseSide('X')}>X</button><button onClick={() => this.chooseSide('O')}>O</button></div>
    } 

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' ' + step.position :
        'Go to game start';

      let bold = (move === this.state.stepNumber ? 'bold' : '');

      return (
        <li key={move}>
          <button className={bold} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

class Board extends React.Component {

  renderSquare(i, win) {
    return (
      <Square 
        value={this.props.squares[i]} 
        onClick={() => this.props.onClick(i)}
        winner={win}
        key={i}
      />
    );
  }

  render() {

    let squares = [];
    let num = 0;
    let row = [];
    let win = false;

    for(let i = 1; i <= 3; i++) {
      row = [];
      for(let j = 1; j <= 3; j++) {

        if (this.props.squares.winSquares) {
          win = this.props.squares.winSquares.indexOf(num) !== -1 ? true : false;  
        }
        
        row.push(this.renderSquare(num, win));
        num++;
      }
      squares.push(<div key={num} className="board-row">{row}</div>);
    }

    return (
      <div>
        {squares}
      </div>
    );
  }
}

function Square(props) {
  let red = props.winner ? ' red' : '';
  return (
    <button className={"square" + red} onClick={props.onClick}>
      {props.value}
    </button>
  )
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

// ========================================

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], squares[b], squares[c], lines[i]] ;
    }
  }
  return null;
}

function winning(board, player){
 if (
   (board[0] === player && board[1] === player && board[2] === player) ||
   (board[3] === player && board[4] === player && board[5] === player) ||
   (board[6] === player && board[7] === player && board[8] === player) ||
   (board[0] === player && board[3] === player && board[6] === player) ||
   (board[1] === player && board[4] === player && board[7] === player) ||
   (board[2] === player && board[5] === player && board[8] === player) ||
   (board[0] === player && board[4] === player && board[8] === player) ||
   (board[2] === player && board[4] === player && board[6] === player)
  ) {
 return true;
 } else {
 return false;
 }
}

function emptyIndexies(board){
  return  board.filter(s => s !== "O" && s !== "X");
}

function numberToCoord(i) {
  const col = i % 3;    // % is the "modulo operator", the remainder of i / width;
  const row = Math.floor(i / 3);    // where "/" is an integer division
  return [col,row];
}