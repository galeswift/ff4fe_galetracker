import { useEffect } from 'react';
import { React, useState } from 'react'
import { Flex, Container, Card } from '@radix-ui/themes';
import { DecorativeBox } from './Decorations'
import * as Select from '@radix-ui/react-select';
import * as Popover from '@radix-ui/react-popover';

function CharacterList() {
    return [
        "images/cecil_paladin.png",
        "images/cecil_dknight.png",
        "images/kain.png",
        "images/rydia_child.png",
        "images/rydia_adult.png",
        "images/tellah.png",
        "images/edward.png",
        "images/rosa.png",
        "images/yang.png",
        "images/palom.png",
        "images/porom.png",
        "images/cid.png",
        "images/edge.png",
        "images/fusoya.png",
        "images/character_blank.png",
    ];
}

function CharacterPopup(props) {
    return <div className="characterPopup">
        {
            CharacterList().map((imagePath, idx) => {
                return <img key={idx} className="character_panel" src={imagePath} onClick={() => props.onClick(imagePath)} />;
            })
        }
    </div>
}

function CharacterSlot(props) {
    var panelData = props.imagePath != "" ? <img src={props.imagePath} className="character_image" /> : <img src="images/character_blank.png" className="character_image" />;
    return <div onClick={() => props.onClick(props)} className="character_panel">
        {panelData}
    </div>

}

export function CharacterPanel(props) {
    const [characters, setCharacters] = useState(["", "", "", "", ""]);
    const [showSelector, setShowSelector] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const onClickCharacter = (index) => {
        setCurrentIndex(index);
        setShowSelector(true);
    }

    const onClosePopup = (imagePath) => {
        const newCharacters = characters.map((item, idx) => { return idx == currentIndex ? imagePath : item; });
        setCharacters(newCharacters);
        setShowSelector(false);
        setCurrentIndex(-1);
    }

    
    return <Flex justify="center">
        {showSelector && <CharacterPopup onClick={onClosePopup}></CharacterPopup>}
        <div className="character_root">
            {
                characters.map((imagePath, idx) => {
                    return <CharacterSlot key={idx} imagePath={imagePath} onClick={() => onClickCharacter(idx)} />
                })
            }
        </div>
    </Flex>
}
