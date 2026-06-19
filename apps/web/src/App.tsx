// import  {type JSX } from 'react'
// import './App.css'
// import {formatDate} from '@repo/utils'

// function App() : JSX.Element {
//   return (<>
//     <p>Bikash khanal</p>
//     <p>{formatDate(new Date())}</p>
//     </>
//   )
// }

// export default App

import { type JSX, useState } from "react";
import "./App.css";
import Login from "./components/auth/login";
import PreSignup from "./components/auth/presignup";
import Signup from "./components/auth/signup";
import type { PreSignupState } from "./types/auth.types";

type AuthScreen = "login" | "presignup" | "signup";

function App(): JSX.Element {
  const [screen, setScreen] = useState<AuthScreen>("login");
  const [preSignupState, setPreSignupState] = useState<PreSignupState | null>(null);

  if (screen === "login") {
    return (
      <Login
        onSuccess={() => {
          // TODO: navigate into the actual app / chat dashboard
          console.log("Logged in!");
        }}
        onSignupClick={() => setScreen("presignup")}
      />
    );
  }

  if (screen === "presignup") {
    return (
      <PreSignup
        onVerified={(state) => {
          setPreSignupState(state);
          setScreen("signup");
        }}
        onLoginClick={() => setScreen("login")}
      />
    );
  }

  // screen === "signup"
  if (!preSignupState) {
    // Guard: shouldn't happen, but fall back to step 1 if state was lost (e.g. page refresh)
    setScreen("presignup");
    return <></>;
  }

  return (
    <Signup
      preSignupState={preSignupState}
      onSuccess={() => setScreen("login")}
    />
  );
}

export default App;