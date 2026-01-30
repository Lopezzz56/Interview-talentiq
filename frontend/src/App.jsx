import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { SignedIn, SignedOut, SignInButton, SignOutButton, SignUpButton, UserButton, UserProfile } from '@clerk/clerk-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
  <h1>WELCOME TO TALENT IQ</h1>
    <SignedOut>
      <SignUpButton></SignUpButton>
      <SignInButton mode="modal" />SignUp Please</SignedOut>
  <SignedIn>
    <SignOutButton></SignOutButton>
      <UserButton />
<UserProfile></UserProfile>
    </SignedIn>

    </>
  )
}

export default App
