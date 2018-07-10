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

import { TTutorContainer }  from "./TTutorContainer";
import { TScene }           from "./TScene";

import { IEFTutorDoc } 	    from "../core/IEFTutorDoc";
import { CONST }            from "../util/CONST";
import { CUtil }            from "../util/CUtil";

import EventDispatcher 	  = createjs.EventDispatcher;


export class TActionTrack extends EventDispatcher 
{
    public traceMode:boolean;

	public tutorDoc:IEFTutorDoc;

    private owner:TScene;
    private id:string;
    private actionid:string;
    private hostModule:string;
    private language:string;

    private html:string;
    private templates:ITemplate;
    private segments:ISegment;
    private timedSet:ICues;

    private text:string;
    private cueSet:string;


	constructor(_owner:TScene, factoryID:string)
	{			
        super();

        this.tutorDoc   = _owner.tutorDoc;
        this.owner      = _owner;
        this.hostModule = _owner.hostModule;
        this.id         = factoryID;

        if(factoryID.startsWith(CONST.ACTION_PFX)) {

            this.actionid = factoryID.split(".")[1];
        }
        else {

        }

	}

    public attachTrack(trackID:string) {

        Object.assign(this, this.tutorDoc.moduleData[this.hostModule].tracks[trackID][this.language]);
    }


    public play() {

    }


    public stop() {

    }


    public gotoAndStop(time:number) {

    }


    public bindPlay(container:TTutorContainer) {

		if(this.traceMode) CUtil.trace(this.id + " is playing");
		
		if(this.tutorDoc.tutorContainer) this.tutorDoc.tutorContainer.playAddThis(this);
		this.play();
    }


}
