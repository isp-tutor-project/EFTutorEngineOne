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

import { ILoaderOptions }       from "./util/ILoaderOptions";
import { IModuleDesc }          from "./util/IModuleDesc";

import { CURLLoader }           from "./network/CURLLoader";
import { CURLRequest }          from "./network/CURLRequest";

import { CEFEvent }             from "./events/CEFEvent";
import { CProgressEvent }       from "./events/CProgressEvent";
import { CSecurityErrorEvent }  from "./events/CSecurityErrorEvent";
import { CIOErrorEvent }        from "./events/CIOErrorEvent";

import { CUtil }                from "./util/CUtil";




export class CEngine {

    public loader:CURLLoader;
    public bootTutor:string;
    public bootSpec:ILoaderOptions;
    public timerID:number;

    public static BOOT_OPTIONS:string   = "./data/bootOptions.json";
    public static LOCAL:string          = "LOCAL";
    public static WAIT:number           = 250;

    public start(_bootTutor:string ) : void
    {
        let efLibrary:CEFRoot = new CEFRoot();
        let tutor:CEFTutor    = new CEFTutor();

        this.bootTutor = _bootTutor;

        console.log("In TutorEngineOne startup");

        this.timerID = this.waitForCreateJS(this.CJSLoadCheck);
    }


    public waitForCreateJS(listener : any ) : number {

        var scope = this;

        if (listener.handleEvent) {
            scope = scope||listener;
            listener = listener.handleEvent;
        }

        scope = scope||this;

        return setInterval(function() {
                listener.call(scope);
            }, CEngine.WAIT);
    }


    public CJSLoadCheck() : void {

        if(EFLoadManager && EFLoadManager.loaded) {
            
            clearInterval(this.timerID);
            this.loadBootOptions();
        }
    }


    public loadBootOptions() {

        this.loader = new CURLLoader();

        this.loader.load(new CURLRequest(CEngine.BOOT_OPTIONS))
            .then((_data) => {

                this.bootSpec = JSON.parse(_data);

                if(this.bootSpec.Mode === CEngine.LOCAL) {
        
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

		for(let i = 0 ; i < ssMetadata.length ; i++) {

			ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
		}

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

        let ClassObj:any = SystemJS.get(superClass);

        if(ClassObj) {

            let p = new ClassObj();

            p.prototype.clone = AnObject.prototype.clone;
            p.prototype.clone = AnObject.prototype.nominalBounds;
            p.prototype.clone = AnObject.prototype.frameBounds;        

            AnObject.prototype = p;
        }
    }


}