import AuthContext from '@providers/auth.context';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect } from 'connectors';
import type { NextPage } from 'next';
import Image from 'next/image';
import React, { useContext, useState } from 'react';
import styles from 'styles/Home.module.css';

const Home: NextPage = () => {
  const { user, error, signInWithEmail, signInWithGoogle, signUpWithEmail, anonymousSignIn, logOut } =
    useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { active, activate, account, deactivate } = useWeb3React();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {active ? (
          <>
            <p> your wallet {account} is connected</p>
            <button onClick={() => deactivate()}> disconnect</button>
          </>
        ) : (
          <>
            <button onClick={() => activate(walletconnect, (err) => console.log('error connecting ', err))}>
              {' '}
              Wallet connect
            </button>
            <button onClick={() => activate(injected, (err) => console.log('error connecting ', err))}>
              {' '}
              Metamask connect{' '}
            </button>
          </>
        )}

        {user ? (
          <>
            <p>
              Welcome <h3>{user.email}</h3>
            </p>
            <button onClick={() => logOut()}>Logout</button>
          </>
        ) : (
          <>
            <div>
              {error ?? <b style={{ color: 'red' }}>{error}</b>}
              <p>email:</p>
              <input type="text" onChange={(e: any) => setEmail(e?.target?.value)} />
              <p>password:</p>
              <input type="password" onChange={(e: any) => setPassword(e?.target?.value)} />
            </div>
            <div>
              <br />
              <button onClick={() => signInWithEmail(email, password)}> login with email</button>
              <br />
              <button onClick={() => signUpWithEmail(email, password)}> sign up with email</button>
              <br />
              <button onClick={() => signInWithGoogle()}> sign in with google</button>
              <br />
              <button onClick={() => anonymousSignIn()}> sign in anonymously</button>
            </div>
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer">
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
