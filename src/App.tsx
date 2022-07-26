import React, {useCallback, useEffect, useState} from 'react';
import './App.css';

interface IPlatforms {
  bottom: number;
  left: number;
}
function App() {
  const [isGameOver, setIsGameOver] = useState<boolean>(false)
  const [platforms, setPlatforms] = useState<IPlatforms[]>([])
  const [doodleBottom, setDoodleBottom] = useState<number>(200)
  const [doodleLeft, setDoodleLeft] = useState<number>(500)
  const [jumpPoint, setJumpPoint] = useState<number>(350)
  const [points,setPoints] = useState(0)
  const [bestScore,setBestScore] = useState<string>(localStorage.getItem('bestScore') || "")
  const [isFall, setIsFall] = useState<boolean>(false)
  const [firstGame,setFirstGame] = useState<boolean>(true)

  let gameInterval: NodeJS.Timeout
  let jumpUpInterval: NodeJS.Timeout
  let jumpDownInterval:NodeJS.Timeout

  useEffect(()=> {
    createPlatforms()
    document.addEventListener('keypress', control);
    return () => {
      document.removeEventListener('keypress', control)
    }}
  ,[])

  useEffect(()=> {
    if(isGameOver) return
    start() 
  }, [platforms])
  
  useEffect(()=> jump(), [doodleBottom])

  function start() {
    if(!isGameOver) {
      gameInterval = setTimeout(()=>movePlatforms(),50)
    } else {
      endGame()
    }
  }

  function endGame() {
    clearTimeout(gameInterval)
    clearTimeout(jumpUpInterval)
    clearTimeout(jumpDownInterval)
    setDoodleLeft(500)
    setDoodleBottom(700)
  }

  function createPlatforms() {
    let platforms = []
    for(let i=0; i<5; i++) {
      let newPlatformBottom = 100+i*175
      let newPlatform = {
        bottom:  newPlatformBottom,
        left: Math.trunc(Math.random()*1200),
      }
      platforms.push(newPlatform)
    }
    setPlatforms(platforms)    
  }

  const movePlatforms = useCallback(() =>  {
    if(doodleBottom > 20) {
      let newPlatforms = platforms.map((platform) => {
       if (platform.bottom<50) {
          return {
            bottom: 800,
            left: Math.trunc(Math.random()*1200),
          }
       }
       return {...platform, bottom: platform.bottom-10}
      })
      setPlatforms(newPlatforms)
    }
  },[platforms])

  const jump = useCallback(() => {
    if(!isFall) {
      jumpUpInterval= setTimeout(function(){
        setDoodleBottom(doodleBottom+30)
        if(doodleBottom>jumpPoint+300) setIsFall(true)
      },30)
    } else {
      fall()
    }

  },[doodleBottom])

  const fall = useCallback(()=>{
    clearTimeout(jumpUpInterval)
      jumpDownInterval = setTimeout(()=>{
        if(doodleBottom>10) {  
        setDoodleBottom(doodleBottom-30)
        } else {
          setIsGameOver(true)
          console.log('game over');  
        }
        platforms.forEach((platform:IPlatforms)=> {
          if (
            (doodleBottom>=platform.bottom) &&
            (doodleBottom<=platform.bottom+60) &&
            ((doodleLeft+200)>=platform.left) && 
            (doodleLeft<=(platform.left+225))
          ) {
            setJumpPoint(doodleBottom)
            setIsFall(false) 
            setPoints(points+1)
          }
        });
      },30)
  },[doodleBottom])

  function control(e:KeyboardEvent) {
    if(e.key === 'a') {
      setDoodleLeft((doodleLeft) =>{ return (doodleLeft - 40)})
    } 
    if(e.key === 'd') {
      setDoodleLeft((doodleLeft) =>{ return (doodleLeft + 40)})
    } 
  }

  function newGame() {
    setIsGameOver(false)
    setPoints(0)
    setTimeout(() => {
      createPlatforms()
      movePlatforms()
      start()
    },100)

  }

  function startGame() {
    setFirstGame(false)
  }

  if(firstGame) {

    return(
      <div className="App">
        <div className='doodle' style={{position: 'relative'}}/>
        <button onClick={startGame}>Start</button>
      </div>
    )
  }

  if(isGameOver) {
    if((Number(bestScore) < Number(points))) {
      let newScore = points.toString()
      localStorage.setItem('bestScore', newScore)
      setBestScore(newScore)
    }

    return(
      <div className="App">
        <div className='doodle' style={{position: 'relative'}}/>
        <span className='score'>Your score: {points}</span>
        <span className='bestScore'>Best score: {bestScore}</span>
        <button onClick={newGame}>Start</button>
      </div>
    )
  }
    
  return (
    <div className="App">
      <div 
        className='doodle' 
        style={{bottom: doodleBottom + 'px', left: doodleLeft + 'px'}}
      />
      { platforms?.length >=1 && 
        platforms?.map((el:IPlatforms) => 
          <div 
            key={el.bottom} 
            className='platform' 
            style={{left: el.left + 'px', bottom: el.bottom + 'px'}}
          />
        )
      }
    </div>
  );
}

export default App;
