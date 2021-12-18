//// http://웹사이트주소/profile/[프로필볼 대상의 eth 주소]

import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'
import { hasEthereum } from '../../utils/ethereum'
import axios from 'axios'

const NowLoading = () => <div>Now Loading......</div>

export default function Home() {
  const [connectedWalletAddress, setConnectedWalletAddressState] = useState('Waiting for the wallet connect......')
  const [walletAddress, setWalletAddress] = useState('')
  const [isloading, setIsLoading] = useState(true)
  const [isNotExist, setIsNotExis] = useState(false) //data not exist
  const router = useRouter()
  const { address } = router.query

  const [userProfile, setUserProfile] = useState(undefined)

  useEffect(() => {
    if(!router.isReady) return
    axios.get(`/samples/userinfo/${address}.json`).then((data) => {
      setIsLoading(false)
      setUserProfile(data.data)
    }).catch((e) => {
      setIsLoading(false)
    })
  }, [router.isReady])
  
  useEffect( () => {
    if(! hasEthereum()) {
      setConnectedWalletAddressState(`MetaMask unavailable`)
      window.addEventListener('ethereum#initialized', async () => {
        console.log('window.ethereum connected by event')
        setConnectedWalletAddress()
        setWalletAddress(await requestAccount())
      }, {
        once: true,
      })
      return
    }
    setConnectedWalletAddress();
  },[])
  
  async function setConnectedWalletAddress() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.enable()
    const signer = provider.getSigner()
    try {
      const signerAddress = await signer.getAddress()
      setConnectedWalletAddressState(`Connected wallet: ${signerAddress}`)
      setWalletAddress(signerAddress)
    } catch {
      setConnectedWalletAddressState('No wallet connected')
      return
    }
  }
  async function manualConnectWallet() {
    if( hasEthereum() ) {
      await window.ethereum.enable()
      const address = await requestAccount()
      setConnectedWalletAddress()
      setWalletAddress(address[0])
      console.log(address)
    }
  }

  return (
    <div className="max-w-lg mt-36 mx-auto text-center px-4">
      <Head>
        <title>User Profile</title>
        <meta name="description" content="Interact with a simple smart contract from the client-side." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="space-y-8">
        <div className="space-y-8">
          <div className="flex flex-col space-y-4">
            { address } profile
            { walletAddress ? (
              <div>
                Wallet Connected
              </div>
            ) : (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md"
                onClick={manualConnectWallet}
              >
                connect Metamask
              </button>
            )
            }
          </div>
          { isloading ? <NowLoading /> : 
            <div>
              {userProfile ? 
              
              <div className="profile-info-righttext">
                <p>이름 : {userProfile.name}</p>
                <p>소개 : {userProfile.funFact}</p>
                <p>취미 : {userProfile.hobby}</p>
                <p>취향 : {userProfile.interest}</p>
                <p>직업 : {userProfile.job}</p>
              </div>
              :
              <div>
                Oops! User not exist
              </div>
              }
            </div>
          }
        </div>
      </main>
    </div>
  )
}