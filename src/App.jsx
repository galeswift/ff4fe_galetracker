import { React, useEffect, useState } from 'react'
import './App.css'
import '@radix-ui/themes/styles.css';
import { CharacterPanel } from './CharacterPanel'
import { KIPanel } from './KIPanel'
import { LocationPanel } from './LocationPanel';
import { TimerPanel } from './TimerPanel';
import { ObjectivePanel } from './ObjectivePanel';

import { Flex, Tabs, Button, Box, Container, Separator, ThemePanel } from '@radix-ui/themes';
import { Theme } from '@radix-ui/themes';
import { DecorativeBox } from './Decorations'



function Footer() {
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem('saved_darkMode')) || false);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const onDarkModeChanged = (bNewDarkMode) => {
    setDarkMode(bNewDarkMode);
    localStorage.setItem('saved_darkMode', bNewDarkMode);
  };

  return <div className="root_footer">
    <Button onClick={() => onDarkModeChanged(!darkMode)}>Dark Mode</Button>
    <Button onClick={() => onDarkModeChanged(!darkMode)}>Options</Button>
    <Button onClick={() => onDarkModeChanged(!darkMode)}>Feedback</Button>
  </div>;
}

function App() {

  return (
    <Theme appearance='inherit' accentColor="gray" panelBackground="translucent">
      <div className="root_panel">
        <header className="header"/>
        <CharacterPanel />
        <Separator size="4" />
        <div className="tracker_section">
          <ObjectivePanel />
          <KIPanel />
        </div>
        <Separator size="4" />
        <LocationPanel />
        <Separator size="4" />
        <TimerPanel />
        <Separator size="4" />
        <Footer />
      </div>
    </Theme>
  )
}

export default App
