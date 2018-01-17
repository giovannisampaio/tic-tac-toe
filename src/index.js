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
      stepNumber: 0,
      xIsNext: true,
      prepare: true,
      ascendingOrder: false
    };
  }

  handleClick(i) {
    // takes a copy of the history from the start until the selected step
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    // takes a copy of the current board
    const squares = current.squares.slice();
    const prepare = this.state.prepare
    const position = current.position.slice();
    if (calculateWinner(squares) || squares[i] || prepare) {
      return;
    }
    // update the board with clicked square
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    position[0] = numberToCoord(i)[0];  
    position[1] = numberToCoord(i)[1];
    this.setState({
      history: history.concat([{
        squares: squares,
        position: position,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleOrder() {
    this.setState({
      ascendingOrder: !this.state.ascendingOrder
    });
  }

  choose(x) {
    if (x === 'O') {
      this.setState({
        xIsNext: false,
        prepare: false
      }) 
    } else {
        this.setState({
        prepare: false
      })
    }
  }

  restart() {
    this.setState(this.getInitialState());
  }


  render() {
    // take a copy of the current state
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const position = current.position;
    const winner = calculateWinner(current.squares);
    const prepare = this.state.prepare;

    let status;
    if (winner) {
      current.squares.winSquares = winner[3];
      status = 'Winner: ' + winner[0];
    } else if (prepare) {
      status = <div><button onClick={() => this.choose('X')}>X</button><button onClick={() => this.choose('O')}>O</button></div>
    } else {
      status = 'Next Plater: ' + (this.state.xIsNext ? 'X' : 'O');
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

    if (this.state.ascendingOrder) {
    moves.sort(function(a,b) {
        return b.key - a.key;
      });
    } 

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
          <button onClick={() => this.toggleOrder()}>Change order</button>
          <button onClick={() => this.restart()}>Restart</button>
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
          win = this.props.squares.winSquares.indexOf(num) != -1 ? true : false;  
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

function numberToCoord(i) {
  const col = i % 3;    // % is the "modulo operator", the remainder of i / width;
  const row = Math.floor(i / 3);    // where "/" is an integer division
  return [col,row];
}