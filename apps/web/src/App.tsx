import  {type JSX } from 'react'
import './App.css'
import {formatDate} from '@repo/utils'

function App() : JSX.Element {
  return (<>
    <p>Bikash khanal</p>
    <p>{formatDate(new Date())}</p>
    </>
  )
}

export default App
