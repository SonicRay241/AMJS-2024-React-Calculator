"use client"

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from "react"

const Home = () => {
  return (
    <div className="w-screen h-screen">
      <div className="flex items-center justify-center h-screen w-screen absolute top-0 left-0">
        <Calculator/>
      </div>
    </div>
  )
}

const numbers = "1234567890"
const operations = "+-x/"
type TCalcOperations = "+" | "-" | "x" | "/" | null
type TCalcState = "leftNum" | "rightNum" | "operation"
type TButtonColor = "gray" | "orange" | "brown"

type TCalcButtonParam = {
  value: string
  callback: () => void
  width: number
  color: TButtonColor
}

const Calculator = () => {
  const { push } = useRouter()

  const [displayValue, setDisplayValue] = useState("0")
  const [history, setHistory] = useState<string[]>([])
  const [calculatorState, setCalculatorState] = useState<TCalcState>("leftNum")

  const historyElement = useRef<HTMLDivElement>(null)
  const displayElement = useRef<HTMLDivElement>(null)

  const numberLeft = useRef(0)
  const numberRight = useRef(0)
  const operation = useRef<TCalcOperations>(null)
  const result = useRef("")
  const calculated = useRef(false)

  const calculate: () => string = () => {
    let result: string
    switch (operation.current) {
      case "+": 
        result= (+(numberLeft.current + numberRight.current)).toString()
        break

      case "-": 
        result = (+(numberLeft.current - numberRight.current)).toString()
        break

      case "x": 
        result = (+(numberLeft.current * numberRight.current)).toString()
        break

      case "/": 
        result = (+(numberLeft.current / numberRight.current)).toString()
        break

      default:
        return "Err"
    }
    if (result == "Infinity" || result == "NaN") return "Err"
    return result
  }

  const processCalcLogic = (buttonValue: string) => {
    switch (buttonValue) {
      case "C":
        if (calculated.current) {
          if (result.current != "Err") setHistory([...history, result.current])
          calculated.current = false
        }
        setDisplayValue("0")
        setCalculatorState("leftNum")
        break

      case "DEL":
        const display = displayValue.replace(/.$/, "")
        if (calculated.current) {
          setHistory([...history, result.current])
          calculated.current = false
        }
        if (calculatorState == "leftNum" || calculatorState == "rightNum") {
          numberRight.current = +display
          if (calculatorState == "leftNum") {
            numberLeft.current = +display
          }
        }
        if (calculatorState == "operation") {
          setCalculatorState("leftNum")
          setDisplayValue(numberLeft.current.toString())
        } else setDisplayValue(display == "" ? "0" : display)
        break

      case "=":
        if (calculatorState == "rightNum") {
          result.current = calculate()
          setCalculatorState("leftNum")
          numberLeft.current = +result.current
          setDisplayValue(result.current)
          calculated.current = true
        }
        break

      case "?":
        push("/support")
        break

      default:
        if (numbers.includes(buttonValue)) {
          if (calculated.current) {
            setHistory([...history, result.current])
          }
          switch(calculatorState) {
            case "leftNum":
              if (!calculated.current) {
                numberLeft.current = +(displayValue+buttonValue)
                numberRight.current = +(displayValue+buttonValue)
                setDisplayValue(numberLeft.current.toString())
              } else {
                setDisplayValue(buttonValue)
                numberLeft.current = +buttonValue
                numberRight.current = +buttonValue
                setCalculatorState("leftNum")
                calculated.current = false
              }

              break

            case "operation":
              setCalculatorState("rightNum")
              if (operations.includes(displayValue[0])) {
                numberRight.current = +buttonValue
                setDisplayValue(numberRight.current.toString())
              } else {
                numberRight.current = +(displayValue+buttonValue)
                setDisplayValue(numberRight.current.toString())
              }

              break
            
            case "rightNum":
              numberRight.current = +(displayValue+buttonValue)
              setDisplayValue(numberRight.current.toString())

              break
          }
        }
        if (operations.includes(buttonValue)) {
          if (calculatorState == "leftNum") {
            setCalculatorState("operation")
            if (calculated.current) {
              setHistory([...history, result.current])
              calculated.current = false
            }
          }
          // if calculatorstate == rightnum, calculate first and move the result.current to firstnum then return to operation.current state
          if (calculatorState == "rightNum") {
            const calculation = calculate()
            if (calculated.current) {
              setHistory([...history, calculation])
            }
            if (calculation == "Err") {
              numberLeft.current = 0
            } else numberLeft.current = +calculation
            calculated.current = false
            setCalculatorState("operation")
          }
          operation.current = buttonValue as TCalcOperations
          setDisplayValue(buttonValue)
        }
        break
    }
  }

  const createButton = (value: string, width: number = 1, color: TButtonColor = "gray") => {
    return { value: value, callback: () => { processCalcLogic(value) }, width: width, color }
  }

  const buttons: string[] = ["C", "DEL", "?", "/", "1", "2", "3", "x", "4", "5", "6", "-", "7", "8", "9", "+", "0", "="]

  useEffect(() => {
    try {
      historyElement.current!.scrollTo(0, 32 * history.length + 12)
      displayElement.current!.scrollLeft += displayElement.current!.clientWidth
    } catch (e) {
      console.log(e);
      console.log("Failed to find element");
    }
  })

  return (
    <div className="rounded-3xl shadow-[rgba(0,_0,_0,_0.4)_0px_30px_90px] w-80 text-white">
      <div className="bg-stone-600 h-30 rounded-t-2xl">
        <div className="h-20 pt-4 px-4 text-2xl overflow-auto no-scrollbar" ref={historyElement}>
          {
            history.map((value, key) => {
              return <h1 key={key}>{value}</h1>
            })
          }
          <div className="h-3"></div>
        </div>
        
        {/* <h1>{calculatorState}</h1> */}
        <div className="overflow-x-auto scrollbar-translucent px-4 pb-2" ref={displayElement}>
          {/* <h1>{calculated.current ? "yes" : "no"}</h1> */}
          <h1 className="text-end text-6xl">{displayValue}</h1>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 relative w-80 h-96 bg-black p-4 rounded-b-2xl">
        {
          buttons.map((value, idx) => {
            const button: TCalcButtonParam = createButton(value, idx < 16 ? 1 : 2, ((idx+1) % 4 == 0 || idx == 17) ? "orange" : idx == 2 ? "brown" : "gray")
            return <CalcButtonComponent key={idx} value={button.value} callback={button.callback} width={button.width} color={button.color}/>
          })
        }
      </div>
    </div>
  )
}

const CalcButtonComponent = ({ value, callback, width, color }: TCalcButtonParam) => {
  let elementWidth = `col-span-1`
  if (width > 1) {
    elementWidth = `col-span-2`
  }
  let btnColor: string
  switch (color) {
    case "gray": btnColor = "bg-[#a8a4a4] active:text-[#a8a4a4]"; break
    case "brown": btnColor = "bg-[#866242] active:text-[#866242]"; break
    case "orange": btnColor = "bg-amber-500 active:text-amber-500"; break
  }
  return (
    <button className={`${elementWidth} rounded-full text-xl ${btnColor} active:bg-white`} onClick={callback}>{value}</button>
  )
}

export default Home