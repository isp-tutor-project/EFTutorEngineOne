import { IModuleDesc } from "./IModuleDesc";

export namespace LoaderPackage {

    export interface _account {
        EB2:string;
        EB3:string;
        EB4:string;

        _loader:string;
        _feature:string;
        roles:string;
        isValidated:boolean;
        
        isActive:boolean;
        Created:string;
        Modified:string;

        // password:string;
        // active:boolean;
        // condition:string;
        // loader:string;
    }

    interface _loader {
        _id:string;

        domain:string;
        appclass:string;
        scenespath:string;
        scenesxml:string;
        graphpath:string;
        graphjson:string;
        anigraphjson:string;

        _tutor:string;
        _moduleSet:string;
        _speller:string;
        _xface:string;

        isActive:boolean;
        Created:string;
        Modified:string;
    }

    interface _module {    
        _id:string;

        path:string;
        mods:string;

        isActive:boolean;
        Created:string;
        Modified:string;
    }

    interface _interface {
        _id:string;

        state:string;
        log:string;

        demo:boolean;
        debug:boolean;
        remote:boolean;
        forcebackbutton:boolean;
        hpcheck:boolean;
        sdcheck:boolean;
        fscheck:boolean;
        skillometer:boolean;

        isActive:boolean;
        Created:string;
        Modified:string;
    }
    interface _library {
        _id:string;

        path:string;
        libs:string;

        isActive:boolean;
        Created:string;
        Modified:string;
    }

    interface _condition {
        _id:string;

        part:string;
        features:string;
        
        isActive:boolean;
        Created:string;
        Modified:string;
    }

    interface _features {
        _id:string;

        description:string;
        features:string;

        isActive:boolean;
        Created:string;
        Modified:string;
    }


    interface study {
        _id:string;

        name:string;
        project:string;
        repository:string;

        isActive:boolean;
        Created:string;
        Modified:string;
    }


    interface studyGroup {
        _id:string;

        classid:string;
        grade:string;
        year:string;
        school:string;
        subject:string;
        teacher_nn:string;
        
        _classList:string;
        _study:string;

        isActive:boolean;
        Created:string;
        Modified:string;
    }

    interface sceneState {
        currNodeID:string;
        currNode: {
            index:number;
        }
    }

    interface bkt {
        _id:string;

        pG:number;
        Bel:number;
        pS:number;
        pT:number;
        pL:number;
    }

    interface dataPoint {
        _id:string;

        start:number;
        value:string;
        duration:number;
    }

    interface phaseState {
        _id:string;

        sceneGraph:sceneState;
        globals:any;
        ktskills:bkt[];
        features:string;
        data:dataPoint[];

        isActive:boolean;
        Created:string;
        Modified:string;
    }


    interface phase {
        _id:string;

        progress:string;
        stateData:phaseState;

        _features:string;
        _phase:string;
        _loader:string;

        isActive:boolean;
        Created:string;
        Modified:string;
    }

    // study.group e.g. Study.PDNP
    //
    interface studyParticipant {
        _id:string;

        userid:string;
        firstname:string;
        lastname:string;
        mi:string;
        study:string;
        
        ability:string;
        class:string;
        period:string;
        teacher:string;

        phases:phase[];

        isActive:boolean;
        Created:string;
        Modified:string;
    }

    interface _authGroups {
        _id:string;

        isActive:boolean;
        Created:string;
        Modified:string;
    }

    interface _tutor {
        _id:string;

        path:string;
    }


    interface _bootloader {
        _id:string;

        accountMode:string;
        default:boolean;

        command:string;
        ui:string;

        authState:string;
        authProtocol:string;

        name:string;
        accountSrc:string;
        protocol:string;
        notes:string;
        
        isActive:boolean;
        Created:string;
        Modified:string;
    }

    interface _settings {
        _id:string;
        
        name:string;
        state:string;

        description:string;
        accountMode:string;
        accountSource:string;

        isActive:boolean;
        Created:string;
        Modified:string;
    }


    export interface IModuleDescr {

        modName:string;
        debugPath?:string;

        compID?:string;
        fonts?:string;
        mixins?:any;
        exts?:any;
        scripts?:any;

    }

    export interface ITutorConfig {
        dependencies:Array<string>;
    }

    export interface IBootdescr {
        accountMode:string;
    }
    
    export interface ILoaderData {

        modName:string;
        filePath:String;

        sourcePath:string;

        onLoad:Function;
        onComplete:Function;
    }
    
    export interface ItutorMaps {
    
        // This is a special signature to avoid typescript error "because <type> has no index signature."
        // on this[<element name>]
        // 
        [key: string]: any;	
    }
    
    
    export interface IPackage {
    
        bootLoader: IBootdescr;
    
        tutors: ItutorMaps;
    }
}