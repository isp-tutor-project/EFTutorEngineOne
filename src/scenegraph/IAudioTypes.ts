

export interface InputType {
    ssml:string;
    text:string;
}

export interface VoiceType {
    name:string;
    languageCode:string;
    ssmlGender:string;
}

export interface AudioType {
    audioEncoding:string;
}

export interface requestType {
    input:InputType;
    voice:VoiceType;
    audioConfig:AudioType;
}

export interface template {

    [key: string]: templVar;
}
export interface templVar {

    values: templValue;    
    volume: number;
    notes: string;
}
export interface templValue {

    [key: string]: string;    
}



export interface segment {

    templateVar: string;

    [key: string]: segmentVal|string;
}
export interface segmentVal {

    id:string;
    SSML: string;
    cues: Array<cuePoint>;
    duration:number;
    trim:number;
    volume: number;
}
export interface cuePoint {
    
    name:string;
    offset: number;
    relTime:number;
}


export interface timedEvents {

    [key: string]: string;

    start:string;
    end:string;
}

export interface scriptInstance {
    html:string;
    text:string;
    cueSet:string;
    segments:Array<segment>;
    trim:Array<number>;
    timedSet:Array<timedEvents>;
    templates: any;
    volume:number;
}

export interface findArray extends Array<string> {
    index:number;
    endIndex?:number;
}


