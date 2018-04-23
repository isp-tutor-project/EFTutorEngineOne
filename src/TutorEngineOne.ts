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

import { ILoaderOptions }       from "./util/ILoaderOptions";
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



export class CEngine {

    public loader:CURLLoader;
    public bootTutor:string;
    public bootSpec:ILoaderOptions;
    public timerID:number;

    public start(_bootTutor:string ) : void
    {
        let efLibrary:CEFRoot = new CEFRoot();
        let tutor:CEFTutor    = new CEFTutor();

        this.bootTutor = _bootTutor;

        console.log("In TutorEngineOne startup: " + _bootTutor);

        // let thisButton = new CEFButton();

        this.loadBootOptions();
    }


    public loadBootOptions() {

        this.loader = new CURLLoader();

        this.loader.load(new CURLRequest(CONST.BOOT_OPTIONS))
            .then((_data) => {

                this.bootSpec = JSON.parse(_data);

                if(this.bootSpec.Mode === CONST.LOCAL) {
        
                    console.log("In Module Loader");

                    this.loadAnModules();
                }
            }).catch((_error) => {

                console.log("Module load failed");
            });
    }
    

    public loadAnModules() {
        
        let engine = this;
        let modulePromises = this.bootSpec.AnModules.map(module => this.injectAnScript(module))

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

		let lib=comp.getLibrary();
		let ss=comp.getSpriteSheet();
		let queue = evt.target;
		let ssMetadata = lib.ssMetadata;

        let temp0:any;
        let temp1:any;
        let temp2:CEFTutor;

		for(let i = 0 ; i < ssMetadata.length ; i++) {

			ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
		}

        // for(comp in lib) {

        //     if(comp.startsWith("thermite")) {

        //         temp0 = new lib[comp]();
        //         temp1 = {prototype:{}};

        //         temp1.prototype.constructor   = lib[comp].prototype.constructor;
        //         temp1.prototype.clone         = lib[comp].prototype.clone;
        //         temp1.prototype.nominalBounds = lib[comp].prototype.nominalBounds;
        //         temp1.prototype.frameBounds   = lib[comp].prototype.frameBounds;

        //         lib[comp].prototype = Object.create(CEFTutor.prototype);

        //         lib[comp].prototype.clone           = temp1.prototype.clone;
        //         lib[comp].prototype.nominalBounds   = temp1.prototype.nominalBounds;
        //         lib[comp].prototype.frameBounds     = temp1.prototype.frameBounds;

        //         temp2 = new lib[comp]();

        //         temp2.Destructor();
        //         break;
        //     }
        // }


        this.mapSubClasses(lib);

		AdobeAn.compositionLoaded(lib.properties.id);
	}	







    public mapSubClasses(AnLib:any) {

        for (const comName in AnLib) {

            if(comName.startsWith("thermite")) {
                
                let varPath: Array<string> = comName.split("__");
                let comPath: string = varPath[0].replace("_","/");

                this.EFsubClass(AnLib[comName], comPath);
            }

        }
    }


    public EFsubClass(AnObject:any, superClass:string) {


        let ClassObj:any = SystemJS.registry.get("http://127.0.0.1/ISP_Tutor/"+superClass);
        let temp1:any;

        if(ClassObj) {

            temp1 = {};

            temp1.constructor   = AnObject.prototype.constructor;
            temp1.clone         = AnObject.prototype.clone;
            temp1.nominalBounds = AnObject.prototype.nominalBounds;
            temp1.frameBounds   = AnObject.prototype.frameBounds;

            AnObject.prototype = Object.create(ClassObj.prototype);

            AnObject.prototype.clone           = temp1.clone;
            AnObject.prototype.nominalBounds   = temp1.nominalBounds;
            AnObject.prototype.frameBounds     = temp1.frameBounds;

        }
    }


}