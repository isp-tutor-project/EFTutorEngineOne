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

import { CEFRoot }              from "./core/CEFRoot";
import { CEFTutor }             from "./core/CEFTutor";
import { CEFAnimator }          from "./core/CEFAnimator";
import { CEFTutorDoc }          from "./core/CEFTutorDoc";

import { LoaderPackage }        from "./util/IBootLoader";
import { IModuleDesc }          from "./util/IModuleDesc";

import { CURLLoader }           from "./network/CURLLoader";
import { CURLRequest }          from "./network/CURLRequest";

import { CEFEvent }             from "./events/CEFEvent";
import { CProgressEvent }       from "./events/CProgressEvent";
import { CSecurityErrorEvent }  from "./events/CSecurityErrorEvent";
import { CIOErrorEvent }        from "./events/CIOErrorEvent";

import { CEFButton }            from "./core/CEFButton";

import { CONST }                from "./util/CONST";
import { CUtil }                from "./util/CUtil";

import MovieClip     		  = createjs.MovieClip;
import DisplayObject          = createjs.DisplayObject;
import { CTutorState } from "./util/CTutorState";
import { CSceneGraphNavigator } from "./scenegraph/CSceneGraphNavigator";



export class CEngine {

    public loader:CURLLoader;
    public bootLoader:string;

    public bootSpec:LoaderPackage.IPackage;
    public tutorObject:any;

    public timerID:number;

    public tutorImagePath:string[] = new Array();

    public moduleSet:string;
    public loadModules:Array<string>;
    public anModules:any;

    public _sceneDescr:any;
    public _sceneGraph:any;
    public _tutorGraph:any;


    constructor() { }


    public start(_bootLoader:string ) : void
    {
        this.bootLoader = _bootLoader.toUpperCase();

        console.log("In TutorEngineOne startup: " + _bootLoader);

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

                this.bootSpec = JSON.parse(_data);

                if(this.bootSpec.bootLoader.accountMode === CONST.LOCAL) {
        
                    console.log("Boot-Loader");
                    
                    this.moduleSet   = this.bootSpec.moduleSets[this.bootSpec.loaders[this.bootLoader.toUpperCase()]._moduleSet]._anModules;
                    this.loadModules = this.moduleSet.split(",").map((modName:string) => modName.trim().toUpperCase());
                    this.anModules   = this.bootSpec.anModules;

                    this.loadBootImage();
                }
                else {
                    console.log("Account Mode unsupported: " + this.bootSpec.bootLoader.accountMode);
                }
            }).catch((_error) => {

                console.log("Boot-Loader failed: " + _error);
            });
    }
    

    public loadBootImage() {

        try {
            for(let tutorel of CONST.TUTOR_JSON_IMAGE) {

                this.tutorImagePath.push("tutors/" + this.bootSpec.tutors[this.bootLoader].path + "/" + tutorel);
            }

            let modulePromises = this.tutorImagePath.map((module, index) => {

                let engine:any = this;
                let loader = new CURLLoader();
        
                return loader.load(new CURLRequest(module))
                    .then((tutorSpec:string) => {
        
                        engine[CONST.TUTOR_FACTORIES[index]] = JSON.parse(tutorSpec);                        

                    })                        
            })

            Promise.all(modulePromises)        
                .then(() => {

                    console.log("Boot-Image Loaded");

                    this.loadAnModules();

                })
        }        
        catch(error){

            console.log("Boot-Image load failed: " + error);
        }
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


    public injectAnScript(module:IModuleDesc) : Promise<any> {

        console.log("Loading Module: " + module.name);

        let engine = this;
        let loader = new CURLLoader();

        return loader.load(new CURLRequest(module.URL))
            .then((scriptText:string) => {

                let tag = document.createElement("script");

                //## TODO: Check if there is a problem using "head" - i.e. is it universal

                // Inject the script with a suffix to expose the source in the debugger listing.
				tag.text = scriptText + "//# sourceURL= http://127.0.0.1/"+ module.tutor + "/" + module.name + ".js";
				document.head.appendChild(tag);

				let comp=AdobeAn.getComposition(module.compID);
			
				let lib=comp.getLibrary();

				let loader = new createjs.LoadQueue(false);

				loader.addEventListener("complete", function(evt){engine.handleComplete(evt,comp)});
				loader.loadManifest(lib.properties.manifest);	
                
            }).catch((_error) => {

                console.log("module load failed");
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

            if(modName.startsWith("TC_")) {
                
                let varPath: Array<string> = modName.split("__");
                let classPath:string[]     = varPath[0].split("_"); 
                let comPath:string         = varPath[0].replace("_","/");

                comPath = comPath.replace("TC/","thermite/");

                importPromises.push(this.importAndMap(AnLib[modName], comPath, classPath[classPath.length-1]));
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


    public importAndMap(AnObject:any, moduleName:string, className:string) {

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
        })
    }


    public constructTutor() {

        // load the target application and let it run

        try {

            this.tutorObject      = new CEFTutorDoc(this._sceneDescr, this._sceneGraph, this._tutorGraph );
            this.tutorObject.name = "Document";
                                    
            console.log("Tutor Construction Complete");
        }
        catch(error) {

                console.log("Tutor Construction Failed:  " + error.toString());
        }

        CUtil.preLoader(false);
    }


}