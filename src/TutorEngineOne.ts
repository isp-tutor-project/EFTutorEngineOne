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
import { TAnimator }            from "./thermite/TAnimator";

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



export class CEngine {

    public loader:CURLLoader;
    public bootLoader:string;

    public tutorDescr:LoaderPackage.IPackage;
    public tutorDoc:any;

    public timerID:number;

    public tutorImagePath:string[] = new Array();

    public moduleSet:string;
    public loadModules:Array<string>;
    public anModules:any;

    public supplSet:string;
    public loadSuppls:Array<string>;
    public supplScripts:any;
    
    public _sceneDescr:any;
    public _sceneGraph:any;
    public _tutorGraph:any;


    constructor() { }


    public start(_bootLoader:string ) : void
    {
        this.bootLoader = _bootLoader.toUpperCase();

        console.log("In TutorEngineOne startup: " + _bootLoader);

        var frequency = 30;
        EFLoadManager.efStage.enableMouseOver(frequency);

        if(_bootLoader) {

            // Do the engine code injection for the Tutor Loader FLX components
            // Generally there aren't any in the Loader project - when debugging a module
            // however there generally are components.
            //
            this.mapThermiteClasses(EFLoadManager.efLoaderLib, CONST.DONT_LAUNCH);

            this.getBootLoader();
        }
    }


    public getBootLoader() {

        this.loader = new CURLLoader();

        this.loader.load(new CURLRequest(CONST.BOOT_LOADER))
            .then((_data) => {

                this.tutorDescr = JSON5.parse(_data);

                if(this.tutorDescr.bootLoader.accountMode === CONST.LOCAL) {
        
                    console.log("Boot-Loader");
                    
                    this.moduleSet   = this.tutorDescr.moduleSets[this.tutorDescr.loaders[this.bootLoader.toUpperCase()]._moduleSet]._anModules;
                    this.loadModules = this.moduleSet.split(",").map((modName:string) => modName.trim().toUpperCase());
                    this.anModules   = this.tutorDescr.anModules;

                    this.supplSet    = this.tutorDescr.supplSets[this.tutorDescr.loaders[this.bootLoader.toUpperCase()]._supplSet]._supplScripts;
                    this.loadSuppls  = this.supplSet.split(",").map((supplName:string) => supplName.trim().toUpperCase());
                    this.supplScripts= this.tutorDescr.supplScripts;

                    this.loadBootImage();
                }
                else {
                    console.log("Account Mode unsupported: " + this.tutorDescr.bootLoader.accountMode);
                }
            }).catch((_error) => {

                console.log("Boot-Loader failed: " + _error);
            });
    }
    

    public loadBootImage() {

        try {
            for(let tutorel of CONST.TUTOR_JSON_IMAGE) {

                this.tutorImagePath.push("tutors/" + this.tutorDescr.tutors[this.bootLoader].path + "/" + tutorel);
            }

            let modulePromises = this.tutorImagePath.map((module, index) => {

                let engine:any = this;
                let loader = new CURLLoader();
        
                return loader.load(new CURLRequest(module))
                    .then((tutorSpec:string) => {
        
                        engine[CONST.TUTOR_FACTORIES[index]] = JSON5.parse(tutorSpec);                        

                    })                        
            })

            Promise.all(modulePromises)        
                .then(() => {

                    console.log("Boot-Image Loaded");

                    this.loadScriptSuppliment();

                })
        }        
        catch(error){

            console.log("Boot-Image load failed: " + error);
        }
    }


    public loadScriptSuppliment() {
        
        let engine = this;
        let scriptPromises = this.loadSuppls.map(script => this.injectScript(this.supplScripts[script]))

        Promise.all(scriptPromises)        
            .then(() => {

                console.log("Script-Suppl load complete");

                // Construct the Tutor Document object and the Tutor Container.
                // These are required for the Thermite mapping.  We inject these into the prototypes of 
                // the Thermite classes.
                //
                this.tutorDoc      = new CEFTutorDoc(this._sceneGraph, this._tutorGraph );            
                this.tutorDoc.name = this.bootLoader;
                    
                this.loadAnModules();

            }).catch(() => {

                console.log("Script-Suppl load failed");
            });
    }


    public injectScript(scriptDescr:IModuleDesc) : Promise<any> {

        console.log("Loading Script: " + scriptDescr);

        let engine = this;
        let loader = new CURLLoader();

        return loader.load(new CURLRequest(scriptDescr.URL))
            .then((scriptText:string) => {

                let tag = document.createElement("script");

                //## TODO: Check if there is a problem using "head" - i.e. is it universal

                // Inject the script with a suffix to expose the source in the debugger listing.
				tag.text = scriptText + "\n//# sourceURL= http://127.0.0.1/"+ scriptDescr.tutor + "/" + scriptDescr.URL;
                document.head.appendChild(tag);
                
                scriptDescr.instance = EFLoadManager.global[scriptDescr.extNameSpace];
                
            }).catch((_error) => {

                console.log("Script load failed: " + _error );
            });
    }


    public loadAnModules() {
        
        let engine = this;
        let modulePromises =this.loadModules.map(module => this.injectAnScript(this.anModules[module]))

        Promise.all(modulePromises)        
            .then(() => {

                console.log("module load complete");

                CUtil.preLoader(false);

            }).catch(() => {

                console.log("module load failed");
            });
    }


    public injectAnScript(moduleDescr:IModuleDesc) : Promise<any> {

        console.log("Loading Module: " + moduleDescr.name);

        let engine = this;
        let loader = new CURLLoader();

        return loader.load(new CURLRequest(moduleDescr.URL))
            .then((scriptText:string) => {

                let tag = document.createElement("script");

                //## TODO: Check if there is a problem using "head" - i.e. is it universal

                // Inject the script with a suffix to expose the source in the debugger listing.
				tag.text = scriptText + "\n//# sourceURL= http://127.0.0.1/"+ moduleDescr.tutor + "/" + moduleDescr.URL;
				document.head.appendChild(tag);

				let comp=AdobeAn.getComposition(moduleDescr.compID);
			
				let lib=comp.getLibrary();

				let loader = new createjs.LoadQueue(false);

				loader.addEventListener("complete", function(evt){engine.handleComplete(evt,comp)});
				loader.loadManifest(lib.properties.manifest);	
                
            }).catch((_error) => {

                console.log("module load failed: " + _error);
            });
    }


	// Note that this is pulled from the Adobe HTML scripts to initialize the newly loaded module.
	//
	//@@ TODO: create declarations 
	//
	public handleComplete(evt:any,comp:any) {

		let lib:any     = comp.getLibrary();
		let ss          = comp.getSpriteSheet();
		let queue       = evt.target;
		let ssMetadata  = lib.ssMetadata;

        // Extract the module name and assign it as a named property of EFLoadManager.modules
        // which is used for dynamic component creation
        //
        for(let compName in lib) {
            if(compName.toUpperCase().startsWith("EFMOD_" )) {

                EFLoadManager.modules[compName.toUpperCase()] = lib;
                break;
            }
        }

		for(let i = 0 ; i < ssMetadata.length ; i++) {

			ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
		}

        // Do the engine code injection 
        //
        this.mapThermiteClasses(lib, CONST.LAUNCH);

		AdobeAn.compositionLoaded(lib.properties.id);
	}	


    public mapThermiteClasses(AnLib:any, launchOnComplete:boolean) {
        
        let engine = this;
        let importPromises:Array<Promise<any>> = new Array();
        
        for (const modName in AnLib) {

            if(modName.startsWith(CONST.THERMITE_PREFIX)) {
                
                let varPath: Array<string> = modName.split("__");
                let classPath:string[]     = varPath[0].split("_"); 
                let comPath:string         = varPath[0].replace("_","/");

                comPath = comPath.replace("TC/","thermite/");

                importPromises.push(this.importAndMap(AnLib[modName], comPath, classPath[classPath.length-1], varPath[1]));
            }
        }

        Promise.all(importPromises)        
            .then(() => {

                console.log("Thermite mapping complete");

                if(launchOnComplete)
                    this.constructTutor();

            }).catch((Error) => {

                console.log("Thermite mapping failed:" + Error);
            });
    }


    public importAndMap(AnObject:any, moduleName:string, className:string, variant:string ) {

        console.log("className: " + className);

        return SystemJS.import(moduleName).then((ClassObj:any) => {

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

            EFLoadManager.classLib[variant.toUpperCase()] = AnObject;
        })
    }


    public constructTutor() {

        // load the target application and let it run

        try {

            this.tutorDoc.initializeTutor(this.tutorDescr );
                                    
            console.log("Tutor Construction Complete");
        }
        catch(error) {

            console.log("Tutor Construction Failed:  " + error.toString());
        }

        CUtil.preLoader(false);
    }


}