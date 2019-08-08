

interface typeCJSmanifest {
    src : string;
    id  : string;
}


interface typeCJSproperties {

    id      : string;
	width   : number;
	height  : number;
	fps     : number;
	color   : string;
    opacity : number;
    
	manifest: Array<typeCJSmanifest>;    
	preloads: Array<string>;

}

interface typeCJSLibrary {

    ssMetadata : Array<string>;
    Stage()    : createjs.Stage;
    properties : typeCJSproperties;

    ef_TutorEngine : any;
    EFTutorLoader  : any;

}

// TODO: expand mode as enum
interface typeEFtutorcomponentOptions {

    compositionID : string;
    tutorID       : string;
}


declare namespace EFLoadManager {
    
    export var window:any;

    export var efLoaderLib:typeCJSLibrary;
    export var classLib:any;

    export var efStage:any;
    export var efRoot:any;
    export var efFeatures:string;
    export var efBootNode:any;

    export var nativeAudio:any;
    export var nativeSpeech:any;
    export var nativeUserMgr:any;
    export var nativeLogMgr:any;

    export var trackOwner:any;
    export var trackEvent:any;

    export var NOLOG:boolean;

    export var rootTutor:string;

    export var modules:any;
	export var options:typeEFtutorcomponentOptions;
	export var loaded:boolean;  

}

declare var EFTut_Suppl:any;

declare var AdobeAn:any;

declare var dom_overlay_container:any;

declare var __global: any;

//export var Tween:any;

// for account registration system
declare var db:any;
declare var collectionID:string;
declare var userID:string;







