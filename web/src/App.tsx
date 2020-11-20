import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './Home/Home';
import Articles from './Articles/Articles';
import MapList from './GameList/MapList/MapList';
import GameList from './GameList/GameList';

function App() {
  return (
    <main>
      <Switch>
        <Route exact path="/">
              <Home />
          </Route>
        <Route path="/articles">
          <Articles />
        </Route>
        <Route path="/maps">
          <GameList />
        </Route>
      </Switch>
    </main>
  );
}

export default App;
