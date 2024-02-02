import React, { useState, useEffect } from 'react'
import { Flex, Text, Separator} from '@radix-ui/themes';

const LocationContext = React.createContext (null);

function GetBossLocations()
{
 return [
    {name:"Adamant Cave", visited:false, active:false},
    {name:"Antlion Cave", visited:false, active:false},
    {name:"Baron Castle [King]", visited:false, active:false},
    {name:"Baron Castle [Odin]", visited:false, active:false},
    {name:"Town of Baron", visited:false, active:false},
    {name:"Fabul [Defend]", visited:false, active:false},
    {name:"Magnes Cave", visited:false, active:false},
    {name:"Mist Village", visited:false, active:false},
    {name:"Mt Ordeals", visited:false, active:false},
]
}
function GetObjectiveLocations()
{
    return [   
        {name:"Adamant Cave", visited:false, active:false},
        {name:"Antlion Cave", visited:false, active:false},
        {name:"Baron Castle [King]", visited:false, active:false},
        {name:"Baron Castle [Odin]", visited:false, active:false},
        {name:"Town of Baron", visited:false, active:false},
        {name:"Fabul [Defend]", visited:false, active:false},
        {name:"Magnes Cave", visited:false, active:false},
        {name:"Mist Village", visited:false, active:false},
        {name:"Mt Ordeals", visited:false, active:false},
        {name:"Toroia Castle", visited:false, active:false},
        {name:"Tower of Zot", visited:false, active:false},
        {name:"Clear Hook Route", visited:false, active:false},
        {name:"Dwarf Castle", visited:false, onComplete:(()=>console.log("Check for warp glitch")), active:false},
        {name:"Fabul [Sheila/Sylph]", visited:false, active:false},
        {name:"Fabul [Sheila/Pan]", visited:false, active:false},
        {name:"Feymarch [Chest]", visited:false, active:false},
        {name:"Feymarch [Asura]", visited:false, active:false},
        {name:"Feymarch [Leviathan]", visited:false, active:false},
        {name:"Lower Babil [Boss]", visited:false, active:true},
        {name:"Lower Babil [Cannon]", visited:false, active:true},
        {name:"Sealed Cave", visited:false, active:false},
        {name:"Sylph Cave", visited:false, active:false},
        {name:"Bahamut", visited:false, active:false},
        {name:"Lunar [Crystal]", visited:false, active:false},
        {name:"Lunar [Masamune]", visited:false, active:false},
        {name:"Lunar [Murasame]", visited:false, active:false},
        {name:"Lunar [Ribbon]", visited:false, active:false},
        {name:"Lunar [White]", visited:false, active:false},
    ];
}

function GetCharacterLocations()
{
    return [
        {name:"Baron Castle", visited:false, active:false},
        {name:"Town of Baron", visited:false, active:false},
        {name:"Damcyan", visited:false, active:true},
        {name:"Eblan Cave", visited:false, active:false},
        {name:"Giant of Babil", visited:false, active:true},
        {name:"Kaipo", visited:false, active:false},
        {name:"Mist Village", visited:false, active:true},
        {name:"Mt Hobbs", visited:false, active:false},
        {name:"Mt Ordeals", visited:false, active:false},
        {name:"Mysidia", visited:false, active:false},
        {name:"Tower of Zot", visited:false, active:false},
        {name:"Waterway", visited:false, active:false},
        {name:"Dwarf Castle", visited:false, active:false},
        {name:"Lunar Sub.", visited:false, active:false},
    ]
}

function GetChestLocations()
{
    return [
        {name:"Castle Eblan", visited:false, count:0, active:false},
        {name:"Eblan Cave", visited:false, count:0, active:false},
        {name:"Giant of Babil", visited:false, count:0, active:false},
        {name:"Tower of Zot", visited:false, count:0, active:false},
        {name:"Upper Babil", visited:false, count:0, active:false},
        {name:"Feymarch", visited:false, count:0, active:false},
        {name:"Lower Babil", visited:false, count:0, active:false},
        {name:"Sylph Cave", visited:false, count:0, active:false},
        {name:"Lunar Path", visited:false, count:0, active:false},
        {name:"Lunar Sub.", visited:false, count:0, active:false},
    ]
}



function LocationItem(props)
{
    return <div className="location_item" onClick={()=>props.onClickLocation()}>{props.children}</div>;
}

function OnClickedLocation(clickedItem, locationList, locationUpdateFunction)
{
    const newList = locationList.map((item, idx) => { return (item.name == clickedItem.name ? {...clickedItem, active:false} : item) });
    locationUpdateFunction(newList);                
}

function BossLocations()
{
    const locationContext = React.useContext(LocationContext);

    return <div className="location_column">
        <img className="location_header_image" src="/images/img_boss.png"/>
        <div className="location_list">
        {
            locationContext.bosses.filter((item)=>item.active).map((item, idx)=>
            {
                return <LocationItem key={idx} item={item} onClickLocation={()=>OnClickedLocation(item, locationContext.bosses, locationContext.updateBosses)}>{item.name}</LocationItem>;
            })
        }
        </div>
    </div>
}

function ObjectiveLocations()
{
    const locationContext = React.useContext(LocationContext);
        
   return <div className="location_column">
    <img className="location_header_image" src="/images/img_objective.png"/>
    <Separator size="4"/>    
    <div className="location_list">
    {
            locationContext.objectives.filter((item)=>item.active).map((item, idx)=>
            {
                return <LocationItem key={idx} item={item} onClickLocation={()=>OnClickedLocation(item, locationContext.objectives, locationContext.updateObjectives)}>{item.name}</LocationItem>;
            })
        }
    </div>
</div>
}

function CharacterLocations()
{
    const locationContext = React.useContext(LocationContext);

    return <div className="location_column">
    <img className="location_header_image" src="/images/img_character.png"/>
    <Separator size="4"/>
    <div className="location_list">
        {
            locationContext.characters.filter((item)=>item.active).map((item, idx)=>
            {
                return <LocationItem key={idx} item={item} onClickLocation={()=>OnClickedLocation(item, locationContext.characters, locationContext.updateCharacters)}>{item.name}</LocationItem>;
            })
        }
        </div>
</div>
}

function ChestLocations()
{
    const locationContext = React.useContext(LocationContext);

    return <div className="location_column">
    <img className="location_header_image" src="/images/img_chest.png"/>
    <Separator size="4"/>
    <div className="location_list">
        {
            locationContext.chests.filter((item)=>item.active).map((item, idx)=>
            {
                return <LocationItem key={idx} item={item} onClickLocation={()=>OnClickedLocation(item, locationContext.chests, locationContext.updateChests)}>{item.name}</LocationItem>;
            })
        }
        </div>
</div>
}

export function LocationPanel()
{    
    const [bossLocations, setBossLocations] = useState(GetBossLocations());
    const [objectiveLocations, setObjectiveLocations] = useState(GetObjectiveLocations());
    const [characterLocations, setCharacterLocations] = useState(GetCharacterLocations());
    const [chestLocations, setChestLocations] = useState(GetChestLocations());

    const [allObjectives, setAllObjectives] = useState({
        bosses:bossLocations, updateBosses:setBossLocations, 
        objectives:objectiveLocations, updateObjectives:setObjectiveLocations, 
        characters:characterLocations, updateCharacters:setCharacterLocations,
        chests:chestLocations, updateChests:setChestLocations}
        );

    useEffect(() => {
        setAllObjectives({
            bosses:bossLocations, updateBosses:setBossLocations, 
            objectives:objectiveLocations, updateObjectives:setObjectiveLocations, 
            characters:characterLocations, updateCharacters:setCharacterLocations,
            chests:chestLocations, updateChests:setChestLocations});

        }, [objectiveLocations, bossLocations, characterLocations, chestLocations]);        

    return <LocationContext.Provider value={allObjectives}>
            <div className="location_root">
            {/* <BossLocations/>  */}
            <ObjectiveLocations/>
            <Separator size="4" orientation="vertical"/>
            <CharacterLocations/>
            <Separator size="4"  orientation="vertical"/>
            <ChestLocations/>
            </div>
    </LocationContext.Provider>  
    
}
