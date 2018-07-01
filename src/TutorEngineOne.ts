//*********************************************************************************
//
//  Copyright(c) 2008,2018 Kevin Willows. All Rights Reserved
//
//	License: Proprietary
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//
//*********************************************************************************

//** Imports

import { TRoot }                from "./thermite/TRoot";

import { CEFTutorDoc }          from "./core/CEFTutorDoc";

import { LoaderPackage }        from "./util/IBootLoader";
import { IModuleDesc }          from "./util/IModuleDesc";

import { CURLLoader }           from "./network/CURLLoader";
import { CURLRequest }          from "./network/CURLRequest";

import { CEFEvent }             from "./events/CEFEvent";
import { CProgressEvent }       from "./events/CProgressEvent";
import { CSecurityErrorEvent }  from "./events/CSecurityErrorEvent";
import { CIOErrorEvent }        from "./events/CIOErrorEvent";

import { CONST }                from "./util/CONST";
import { CUtil }                from "./util/CUtil";

import MovieClip     		  = createjs.MovieClip;
import DisplayObject          = createjs.DisplayObject;
import { IEFTutorDoc } from "./core/IEFTutorDoc";



export class CEngine {

    public loader:CURLLoader;
    public bootTutor:string;

    public tutorDescr:LoaderPackage.IPackage;
    public tutorDoc:IEFTutorDoc;

    public timerID:number;

    public sourcePath:string[];
    

	// This is a special signature to avoid typescript error "because <type> has no index signature."
	// on this[<element name>]
	// 
	[key: string]: any;


    constructor() { }


    public start(_bootTutorID:string ) : void
    {
        this.bootTutor   = _bootTutorID;

        console.log("In TutorEngineOne startup: " + _bootTutorID);

        // Setup the mouse tracking for CreateJS
        // 
        var frequency = 30;
        EFLoadManager.efStage.enableMouseOver(frequency);

        if(_bootTutorID) {

            // Construct the Tutor Document object and the Tutor Container.
            // We inject this into the prototypes of the Thermite classes.
            //
            this.tutorDoc      = new CEFTutorDoc();            //this._sceneGraph, this._tutorGraph 
            this.tutorDoc.name = this.bootTutor;

            this.loadBootImage();
        }
    }


    private loadBootImage() {
        
        let loaderPromises: Promise<any>[] = [];

        this.tutorDoc.buildBootSet(this.bootTutor);
        loaderPromises = this.tutorDoc.loadFileSet();

        Promise.all(loaderPromises)        
        .then(() => {

            console.log("Tutor Boot Image Complete");

            this.loadTutorImage();
        })                
    }    


    private loadTutorImage() {
        
        let loaderPromises: Promise<any>[] = [];

        this.tutorDoc.buildTutorSet();
        loaderPromises = this.tutorDoc.loadFileSet();

        Promise.all(loaderPromises)        
        .then(() => {

            console.log("Tutor Image Complete");

            this.loadCreateJSResources();
        })                
    }    


    private loadCreateJSResources() {
        
        let loaderPromises: Promise<any>[] = [];
        let engine:any = this;

        for(let fileLoader of this.tutorDoc.loaderData) {

            if(fileLoader.compID) {
                let comp   = AdobeAn.getComposition(fileLoader.compID);			
                let lib    = comp.getLibrary();
                let loader = new createjs.LoadQueue(false);

                loaderPromises.push(new Promise((resolve, reject) => {
                    loader.addEventListener("complete", function(evt){engine.handleComplete(evt,comp,resolve,reject)});
                    loader.addEventListener("error", function(evt){engine.handleError(evt,comp,reject)});
                    loader.loadManifest(lib.properties.manifest);	
                }));                
            }
        }

        Promise.all(loaderPromises)        
        .then(() => {

            console.log("Tutor init Complete");

            this.startTutor();
        })                

    }


	// Note that this is pulled from the Adobe HTML scripts to initialize the newly loaded module.
	//
	//@@ TODO: create declarations 
	//
	public handleComplete(evt:any,comp:any, resolve:Function, reject:Function) {

		let lib:any     = comp.getLibrary();
		let ss          = comp.getSpriteSheet();
		let queue       = evt.target;
		let ssMetadata  = lib.ssMetadata;

        // Extract the module name and assign it as a named property of EFLoadManager.modules
        // which is used for dynamic component creation
        //
        for(let compName in lib) {

            let moduleName:string = compName.toUpperCase();
            
            if(moduleName.startsWith("EFMOD_" )) {

                lib._ANmoduleName = moduleName;
                EFLoadManager.modules[moduleName]  = lib;
                EFLoadManager.classLib[moduleName] = {};
                break;
            }
        }

		for(let i = 0 ; i < ssMetadata.length ; i++) {

			ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
		}

        // Do the engine code injection 
        //
        this.mapThermiteClasses(lib, resolve, reject);

        AdobeAn.compositionLoaded(lib.properties.id);        
	}	
	public handleError(evt:any,comp:any, reject:Function) {

        reject("AnimateCC Resource Load Failed:");
    }



    public mapThermiteClasses(AnLib:any, resolve:Function, reject:Function) {
        
        let engine = this;
        let importPromises:Array<Promise<any>> = new Array();
        
        for (const compName in AnLib) {

            if(compName.startsWith(CONST.THERMITE_PREFIX)) {
                
                let varPath: Array<string> = compName.split("__");
                let classPath:string[]     = varPath[0].split("_"); 
                let comPath:string         = varPath[0].replace("_","/");

                comPath = comPath.replace("TC/","thermite/");

                importPromises.push(this.importAndMap(AnLib._ANmoduleName, AnLib[compName], comPath, classPath[classPath.length-1], varPath[1]));
            }
        }

        Promise.all(importPromises)        
            .then(() => {
                
                console.log("Thermite mapping complete");

                // resolve the preloader promise
                if(resolve)
                    resolve();

            }).catch((Error) => {

                console.log("Thermite mapping failed:" + Error);

                // reject the preloader promise
                if(reject)
                    reject();
            });
    }


    public importAndMap(AnModuleName:string, AnObject:any, classPath:string, className:string, variant:string ) {

        console.log("Import and Map: " + AnModuleName + " => " + classPath + " : " + variant);

        return SystemJS.import(classPath).then((ClassObj:any) => {

            let temp1:any = {};

            temp1.constructor   = AnObject.prototype.constructor;
            temp1.clone         = AnObject.prototype.clone;
            temp1.nominalBounds = AnObject.prototype.nominalBounds;
            temp1.frameBounds   = AnObject.prototype.frameBounds;

            AnObject.prototype = Object.create(ClassObj[className].prototype);

            AnObject.prototype.clone           = temp1.clone;
            AnObject.prototype.nominalBounds   = temp1.nominalBounds;
            AnObject.prototype.frameBounds     = temp1.frameBounds;

            // Make the tutor document and container available to all thermite objects
            // when they are created.
            //
            AnObject.prototype.tutorDoc       = this.tutorDoc;
            AnObject.prototype.tutorContainer = this.tutorDoc.tutorContainer;

            EFLoadManager.classLib[AnModuleName][variant.toUpperCase()] = AnObject;            
        })
    }


    public startTutor() {
        
        console.log("module load complete: ");

        this.constructTutor();
        
        CUtil.preLoader(false);
    }


    public constructTutor() {

        // load the target application and let it run

        try {

            this.tutorDoc.initializeTutor();
                                    
            console.log("Tutor Construction Complete");
        }
        catch(error) {

            console.log("Tutor Construction Failed:  " + error.toString());
        }
    }


}