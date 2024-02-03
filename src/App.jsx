import { React, useEffect, useState } from 'react'
import './App.css'
import '@radix-ui/themes/styles.css';
import { CharacterPanel } from './CharacterPanel'
import { KIPanel } from './KIPanel'
import { LocationPanel } from './LocationPanel';
import { TimerPanel } from './TimerPanel';
import { ObjectivePanel } from './ObjectivePanel';

import { Flex, Tabs, Button, Box, Container, Separator } from '@radix-ui/themes';
import { Theme } from '@radix-ui/themes';
import { DecorativeBox } from './Decorations'



function Footer(props) {

  return <div className="root_footer">
    <Button size="2" onClick={props.onDarkModeChanged}>Dark Mode</Button>
    <Button size="2" onClick={props.onTrackingModeChanged}>Flags</Button>
    <Button size="2" onClick={props.onDarkModeChanged}>Feedback</Button>
  </div>;
}

function TrackingMode() {
  return <> 
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
  </>;
}

function FlagsetMode(props)
{
  const onTextAreaChanged = (event) =>
  {
    props.onFlagsetChanged(event.target.value);
  }

 return <div className="flagset_mode_root">
    <header>Enter Flagset</header>
    <textarea className="flagset_text_area" placeholder="Enter Flagset Here" onChange={onTextAreaChanged} value={props.flagset}>
    </textarea>
  </div>;
}

function App() {
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem('saved_darkMode')) || false);  
  const [flagset, setFlagset] = useState(JSON.parse(localStorage.getItem('saved_flagset')) || "O1:quest_forge/random:6,tough_quest/req:6/win:crystal Kmain/summon/moon/nofree Pkey Cstandard/nofree/distinct:9/start:any/no:fusoya/j:abilities Tpro Sstandard Bstandard/alt:gauntlet Etoggle Glife/sylph/backrow -kit:basic -noadamants -spoon -smith:alt");

  const [inTrackingMode, setTrackingMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const onDarkModeChanged = () => {
    localStorage.setItem('saved_darkMode', !darkMode);
    setDarkMode(!darkMode);
  };

  const onTrackingModeChanged = () => {
    setTrackingMode(!inTrackingMode);
  };

  const onFlagsetChanged = (flagset) => {
    setFlagset(flagset);
    console.log("Flagset changed "+ flagset);
  };

  return (
    <Theme appearance='inherit' accentColor="gray" panelBackground="translucent">
      <div className="root_panel">
        <header className="header" />
        { inTrackingMode && <TrackingMode/> }
        { !inTrackingMode && <FlagsetMode onFlagsetChanged={onFlagsetChanged} flagset={flagset}/>}
        <Footer onDarkModeChanged={onDarkModeChanged} onTrackingModeChanged={onTrackingModeChanged}/>
      </div>
    </Theme>
  )
}

export default App
