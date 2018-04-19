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

//** imports

import { CURLRequest }      from "./CURLRequest";

import { IModuleDesc }      from "../util/IModuleDesc";

import { CEFEvent }         from "../events/CEFEvent";
import { CIOErrorEvent }    from "../events/CIOErrorEvent";
import { CProgressEvent }   from "../events/CProgressEvent";


import EventDispatcher = createjs.EventDispatcher;



export class CURLLoader extends EventDispatcher
{
    public request:CURLRequest;

    public error:string;
    public data:string;


    constructor(_request:CURLRequest=null) {

        super();

        this.request = _request;
    }


	public loadJSON(pathToFile:string, scope:any, callback:Function) {

		let async:boolean;

		let xhr = new XMLHttpRequest();
		xhr.overrideMimeType("application/json");
		xhr.open('GET', pathToFile, async = true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
	
				// .open will NOT return a value but simply returns undefined in async mode so use a callback
				//
				callback.call(scope, xhr.responseText);	
			}
		}
		xhr.send(null);		

		// console.log("Request sent: " + pathToFile);
	}
    

	public load(_request:CURLRequest, progressFn:Function = null) : Promise<any> {

		this.request = _request;

        return this.loadAsyncModule(progressFn);
    }

    
	public loadAsyncModule(progressFn:Function ): Promise<any> {

		let loader = this;
		
		var requestPromise = new Promise(function(resolve, reject) {

			let xhr    = new XMLHttpRequest;

			xhr.open("GET", loader.request.url, true);		
            xhr.timeout = 2000;

			xhr.onload = function (e) {
                if (xhr.readyState === 4) {

                    if (xhr.status === 200) {

                        resolve(xhr.response);

                    } else {

                        console.error(xhr.response);
                        reject(xhr.response);
                    }
                }
			};

			xhr.onprogress = function (e) {

				if(progressFn)
					progressFn(loader.request, e);
			};

            xhr.ontimeout = function (e) {
				 
                console.error("Timeout: loadAsyncModule");
                reject("timeout");
            };
                          
			xhr.send();		
		});

		return requestPromise;
	}

}
