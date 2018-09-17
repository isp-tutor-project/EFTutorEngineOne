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

import { TRoot } 			from "./TRoot";
import { TObjectDyno } 		from "./TObjectDyno";
import { TSceneBase }  		from "./TSceneBase";
import { TObject }          from "./TObject";

import { TTutorContainer } 	from "./TTutorContainer";

import { CEFNavigator } 	from "../core/CEFNavigator";
import { CEFTimeLine }      from "../core/CEFTimeLine";

import { CEFEvent }     	from "../events/CEFEvent";

import { ILogManager }  	from "../managers/ILogManager";


import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";

import MovieClip     	  = createjs.MovieClip;
import Point     		  = createjs.Point;
import Shape     		  = createjs.Shape;
import Sprite     		  = createjs.Sprite;
import Tween    		  = createjs.Tween;
import ColorMatrixFilter  = createjs.ColorMatrixFilter;
import BlurFilter		  = createjs.BlurFilter;
import DisplayObject      = createjs.DisplayObject;
import Ease			      = createjs.Ease;


//@@ Bug - Note that tweens start automatically so the push onto the running array should be coupled with a stop 
//		   to allow us to control the onFinish proc.

export class TSelector
{

    private selectors:Array<string>;
    private regex:Array<any>;
    private targets:Array<any>;


    constructor(host:TObject, selectorStr:string) {

        this.selectors = selectorStr.split("|");
        this.regex     = [];
        this.targets   = [];

        for(let i1=0 ; i1 < this.selectors.length ; i1++) {

            let selectorGrp = this.selectors[i1].split(",");

            if(selectorGrp.length > 1) {

                let regexGrp:Array<RegExp> = [];

                for(let i1=0 ; i1 < selectorGrp.length ; i1++) {

                    regexGrp.push(new RegExp(selectorGrp[i1]));
                }
                this.regex.push(regexGrp);
            }
            else {
                this.regex.push(new RegExp(this.selectors[i1]));
            }
        }

        this.resolveSelectors(host, this.regex);
    }


    private testSelector(currRegEx:RegExp, element:string) {

        return currRegEx.test(element);
    }


    private resolveSelectors(host:any, regex:Array<RegExp>) {

        let currRegEx = regex[0];

        if(Array.isArray(currRegEx)) {

            currRegEx.forEach(innerRegEx => {

                for(let element in host) {
                
                    if(innerRegEx.test(element)) {
                
                        if(regex.length > 1) {
        
                            this.resolveSelectors(host[element], regex.slice(1));
                        }
                        else {
                            this.targets.push(host[element]);
                        }          
                    }          
                }
            });

        }
        else for(let element in host) {        
            
            if(currRegEx.test(element)) {
                
                if(regex.length > 1) {

                    this.resolveSelectors(host[element], regex.slice(1));
                }
                else {
                    this.targets.push(host[element]);
                }
            }
        }
    }


    // public map(func:Function) {

    //     this.targets.map(func.apply(this, element));

    // }    
    
    public hide() {

        this.targets.forEach(component => {

            if(component.hide instanceof Function) {
                component.hide();
            }
        });
    }

    public show() {

        this.targets.forEach(component => {

            if(component.show instanceof Function) {
                component.show();
            }
        });
    }

    public enable() {

        this.targets.forEach(component => {

            if(component.enable instanceof Function) {
                component.enable(true);
            }
        });
    }

    public disable() {

        this.targets.forEach(component => {

            if(component.enable instanceof Function) {
                component.enable(false);
            }
        });
    }

    public play() {

        this.targets.forEach(component => {

            if(component.playMC instanceof Function) {
                component.playMC();
            }
        });
    }


}