import { render } from 'preact';
import '@/main.css';
import Router from 'preact-router';
import { createHashHistory } from 'history';

// Pages
import Home from '@/pages/Home';
import Send from '@/pages/Send';
import Receive from '@/pages/Receive';

function Main() {
  return (
    /* @ts-ignore */
    <Router history={createHashHistory()}>
      <Home path="/" />
      <Send path="/send" />
      <Receive path="/receive" />
    </Router>
  );
}

render(
  <Main />,
  document.querySelector('#root') as HTMLElement,
);