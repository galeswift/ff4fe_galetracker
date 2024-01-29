import { React, useState,useRef } from 'react'
import { Button, Text, Strong,  Separator } from '@radix-ui/themes';

function convertHMS(value) {
    const sec = parseInt(value, 10) / 1000; // convert value to number if it's string
    let hours = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = Math.floor(sec - (hours * 3600) - (minutes * 60)); //  get seconds
    let ms = Math.floor(value % 1000 / 10);
    // add 0 if value < 10; Example: 2 => 02
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    if (ms < 10) { ms = "0" + ms; }
    return <div id="timerText" className="timer_text">{hours + ':' + minutes + ':' + seconds + ':' }<span className="timer_ms">{ms}</span></div>;
}

function copyTimerToClipboard(timeDiv)
{
    var timeString = timeDiv.textContent;
    // navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
        // navigator clipboard api method'
        return navigator.clipboard.writeText(timeString.substring(0, timeString.length - 3));
    } else {
        // text area method
        let textArea = document.createElement("textarea");
        textArea.value = timeString.substring(0, timeString.length - 3);
        // make the textarea out of viewport
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise((res, rej) => {
            // here the magic happens
            document.execCommand('copy') ? res() : rej();
            textArea.remove();
        });
    }
};
export function TimerPanel()
{
    const [timeString, setTimeString] = useState(convertHMS(0));
    const [timerStarted, setTimerStarted] = useState(false);
    const startTime = useRef(0);
    const bankedTime = useRef(0);
    const timerObject = useRef(null);
    const timerTextRef = useRef(timeString);

    const startTimer = ()=>{
        startTime.current = Date.now();
        timerObject.current = setInterval(timerUpdate, 10);
        setTimerStarted( true );
    };

    const pauseTimer = ()=>{
        bankedTime.current = Date.now() - startTime.current;
        clearInterval(timerObject.current);
        setTimerStarted( false );
    };

    const resetTimer = ()=>
    {
        startTime.current = 0;
        bankedTime.current = 0;
        clearInterval(timerObject.current);
        setTimerStarted( false );      
        setTimeString(convertHMS(0));  
    };

    const timerUpdate = () =>
    {        
        setTimeString(convertHMS(Date.now() - startTime.current + bankedTime.current));
    }    

    return <div id="timer_root">
            <div className={timerStarted ? "timer_running" : "timer_stopped" }>
                {timeString}
            </div>
            <div className="timer_buttons">
                <Button size="2" disabled={timerStarted} variant="solid" id="startButton" onClick={startTimer}>Start</Button>
                <Separator size="2" orientation="vertical"/>
                <Button size="2" disabled={!timerStarted} variant="solid" id="pauseButton" onClick={pauseTimer}>Pause</Button>
                <Separator size="2" orientation="vertical"/>
                <Button size="2" variant="solid" id="resetButton" onClick={resetTimer}>Reset</Button>
                <Separator size="2" orientation="vertical"/>
                <Button size="2" variant="solid" id="copyToClipboardButton" onClick={()=>copyTimerToClipboard(document.getElementById("timerText"))}>Copy</Button>
            </div>
        </div>    
}
