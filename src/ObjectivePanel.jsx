import { React, useState, useRef } from 'react'
import { Switch, Flex, Button, Text, ScrollArea, TextField} from '@radix-ui/themes';
import * as Popover from '@radix-ui/react-popover';
import { MixerHorizontalIcon, Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'

function ObjectiveList() {
    return [
        { name: "Classic Forge the Crystal", complete: false },
        { name: "Classic Giant", complete: false },
        { name: "Fiends ", complete: false },
        { name: "Dark Matter Hunt", complete: false },
        { name: "Get Cecil", complete: false },
        { name: "Get Kain", complete: false },
        { name: "Get Rydia", complete: false },
        { name: "Get Tellah", complete: false },
        { name: "Get Edward", complete: false },
        { name: "Get Rosa", complete: false },
        { name: "Get Yang", complete: false },
        { name: "Get Palom", complete: false },
        { name: "Get Porom", complete: false },
        { name: "Get Cid", complete: false },
        { name: "Get Edge", complete: false },
        { name: "Get FuSoYa", complete: false },
        { name: "Defeat D.Mist", complete: false },
        { name: "Defeat Officer", complete: false },
        { name: "Defeat Octomamm", complete: false },
        { name: "Defeat Antlion", complete: false },
        { name: "Defeat Waterhag (boss version)", complete: false },
        { name: "Defeat MomBomb", complete: false },
        { name: "Defeat the Fabul Gauntlet", complete: false },
        { name: "Defeat Milon", complete: false },
        { name: "Defeat Milon Z.", complete: false },
        { name: "Defeat D.Knight", complete: false },
        { name: "Defeat the Guards (boss)", complete: false },
        { name: "Defeat Karate", complete: false },
        { name: "Defeat Baigan", complete: false },
        { name: "Defeat Kainazzo", complete: false },
        { name: "Defeat the Dark Elf (dragon form)", complete: false },
        { name: "Defeat the Magus Sisters", complete: false },
        { name: "Defeat Valvalis", complete: false },
        { name: "Defeat Calbrena", complete: false },
        { name: "Defeat Golbez", complete: false },
        { name: "Defeat Dr. Lugae", complete: false },
        { name: "Defeat the Dark Imps (boss)", complete: false },
        { name: "Defeat K.Eblan and Q.Eblan", complete: false },
        { name: "Defeat Rubicant", complete: false },
        { name: "Defeat EvilWall", complete: false },
        { name: "Defeat Asura", complete: false },
        { name: "Defeat Leviatan", complete: false },
        { name: "Defeat Odin", complete: false },
        { name: "Defeat Bahamut", complete: false },
        { name: "Defeat Elements", complete: false },
        { name: "Defeat CPU", complete: false },
        { name: "Defeat Pale Dim", complete: false },
        { name: "Defeat Wyvern", complete: false },
        { name: "Defeat Plague", complete: false },
        { name: "Defeat the D.Lunars", complete: false },
        { name: "Defeat Ogopogo", complete: false },
        { name: "Defeat the boss of the Mist Cave", complete: false },
        { name: "Defeat the boss of the Waterfall", complete: false },
        { name: "Complete the Antlion Nest", complete: false },
        { name: "Rescue the hostage on Mt. Hobs", complete: false },
        { name: "Defend Fabul", complete: false },
        { name: "Complete Mt. Ordeals", complete: false },
        { name: "Defeat the bosses of Baron Inn", complete: false },
        { name: "Liberate Baron Castle", complete: false },
        { name: "Complete Cave Magnes", complete: false },
        { name: "Complete the Tower of Zot", complete: false },
        { name: "Defeat the bosses of Dwarf Castle", complete: false },
        { name: "Defeat the boss of Lower Bab-il", complete: false },
        { name: "Launch the Falcon", complete: false },
        { name: "Complete the Sealed Cave", complete: false },
        { name: "Defeat the queen at the Town of Monsters", complete: false },
        { name: "Defeat the king at the Town of Monsters", complete: false },
        { name: "Defeat the Baron Castle basement throne", complete: false },
        { name: "Complete the Giant of Bab-il", complete: false },
        { name: "Complete Cave Bahamut", complete: false },
        { name: "Conquer the vanilla Murasame altar", complete: false },
        { name: "Conquer the vanilla Crystal Sword altar", complete: false },
        { name: "Conquer the vanilla White Spear altar", complete: false },
        { name: "Conquer the vanilla Ribbon room", complete: false },
        { name: "Conquer the vanilla Masamune altar", complete: false },
        { name: "Burn village Mist with the Package", complete: false },
        { name: "Cure the fever with the SandRuby", complete: false },
        { name: "Unlock the sewer with the Baron Key", complete: false },
        { name: "Break the Dark Elf's spell with the TwinHarp", complete: false },
        { name: "Open the Toroia treasury with the Earth Crystal", complete: false },
        { name: "Drop the Magma Key into the Agart well", complete: false },
        { name: "Destroy the Super Cannon", complete: false },
        { name: "Unlock the Sealed Cave", complete: false },
        { name: "Raise the Big Whale", complete: false },
        { name: "Trade away the Rat Tail", complete: false },
        { name: "Have Kokkol forge Legend Sword with Adamant", complete: false },
        { name: "Wake Yang with the Pan", complete: false },
        { name: "Return the Pan to Yang's wife", complete: false },
        { name: "Trade away the Pink Tail", complete: false },
        { name: "Unlock the Pass door in Toroia", complete: false }
    ]
}

function ObjectivePopup(props) {
    const allObjectives = ObjectiveList();
    var filterTexts = props.filter.toLowerCase().split(' ').filter(item=>item!="");
    return <>
        {
            allObjectives.filter((item)=> (filterTexts.length == 0 || filterTexts.filter((filterString)=>item.name.toLowerCase().includes(filterString)).length > 0 )).map((item, idx) => {
                return <div onClick={()=>props.onSelectObjective(item.name)} className="objective_selector_item" key={idx}>{item.name}</div>
            })
        }
    </>;
}

function SearchBox(props)
{
    return  <>
        <TextField.Root color="tomato" className="objective_search">
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
        <TextField.Input placeholder="Search by name..."  autoComplete="true" onChange={props.onType} onKeyDown={props.onKeyDown}/>
      </TextField.Root>
      </>;
}

function SingleObjective() {
    const [filterText, setFilterText] = useState("");
    const [objectiveName, setObjectiveName] = useState("Objective")
    const [popupOpen, setPopupOpen] = useState(false);

    const onTyped = (event)=>
    {
        setFilterText(event.currentTarget.value);
    }

    const onKeyWentDown = (event)=>
    {
        console.log(event);
        if ( event.key == "Enter")
        {
            var filterTexts = filterText.toLowerCase().split(' ').filter(item=>item!="");
            const bestObjectives = ObjectiveList().filter((item)=> (filterTexts.length == 0 || filterTexts.filter((filterString)=>item.name.toLowerCase().includes(filterString)).length > 0 ));
            if (bestObjectives.length > 0)
            {
                setObjectiveName(bestObjectives[0].name);
                setPopupOpen(false);
            }
        }
    }

    const onSelectObjective = (objectiveName)=>
    {
        setObjectiveName(objectiveName);
        setPopupOpen(false);
    }

    return <Flex gap="2">
        <Switch color="green"></Switch>{objectiveName}
        <Popover.Root open={popupOpen}>
            <Popover.Trigger asChild>
                <button className="IconButton" aria-label="Update dimensions" onClick={()=>{setPopupOpen(true); setFilterText("")}}>
                    <MixerHorizontalIcon />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className="PopoverContent" sideOffset={5} side="right" onOpenAutoFocus="true">
                    <SearchBox onType={onTyped} onKeyDown={onKeyWentDown}/>
                    <div className="objective_popup">
                        <ObjectivePopup filter={filterText} onSelectObjective={onSelectObjective}></ObjectivePopup>
                        <Popover.Arrow className="PopoverArrow" />
                    </div> 
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    </Flex>
}
export function ObjectivePanel() {
    return <div className="objective_root">
        <SingleObjective />
        <SingleObjective />
        <SingleObjective />
        <SingleObjective />
        <SingleObjective />
    </div>

}
