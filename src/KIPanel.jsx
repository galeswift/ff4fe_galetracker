import { React, useState } from 'react'
export function KIPanel()
{
    const kiList = [
        { imagePath:"images/ki_baronkey.png", owned:false },        
        { imagePath:"images/ki_lucakey.png", owned:false },
        { imagePath:"images/ki_magmakey.png", owned:false },
        { imagePath:"images/ki_towerkey.png", owned:false },
        { imagePath:"images/ki_dark.png", owned:false },
        { imagePath:"images/ki_earth.png", owned:false },
        { imagePath:"images/ki_hook.png", owned:false },
        { imagePath:"images/ki_harp.png", owned:false },
        { imagePath:"images/ki_package.png", owned:false },
        { imagePath:"images/ki_Pan.png", owned:false },        
        { imagePath:"images/ki_sandruby.png", owned:false },
        { imagePath:"images/ki_rattail.png", owned:false },
        { imagePath:"images/ki_adamant.png", owned:false },
        { imagePath:"images/ki_legend.png", owned:false },
        { imagePath:"images/ki_crystal.png", owned:false },
        { imagePath:"images/ki_pinktail.png", owned:false },        
        { imagePath:"images/ki_pass.png", owned:false },
    ];

    const [currentkiList, setCurrentkiList] = useState(kiList);
    
    const onClickedKI = (kiIDX) =>
    {
        const newKIList = currentkiList.map((item, index)=>{
            return index==kiIDX ? {imagePath:item.imagePath, owned:!item.owned} : item;
        })
        setCurrentkiList(newKIList);
    }
    return  <div className="ki_root">
        {   currentkiList.map((item, idx)=>
        {
            return <div key={idx} className={"ki_item " + (item.owned ? "ki_owned_bg" : "ki_unowned_bg")}><img key={idx} src={item.imagePath} className={item.owned ? "ki_owned" : "ki_unowned"} onClick={()=>onClickedKI(idx)}/></div>            
        })
    }
    </div>
    
}
