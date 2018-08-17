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

import { CEFNavEvent } 			from "../events/CEFNavEvent";

import { CSceneTrack }          from "../scenegraph/CSceneTrack";
import { CSceneGraph } 		    from "../scenegraph/CSceneGraph";
import { CSceneHistory }        from "../scenegraph/CSceneHistory";
import { CSceneHistoryNode }    from "../scenegraph/CSceneHistoryNode";

import { CEFSceneCueEvent } 	from "../events/CEFSceneCueEvent";
import { CEFEvent } 			from "../events/CEFEvent";

import { CUtil } 				from "../util/CUtil";
import { CONST }                from "../util/CONST";
import { TScene } from "./TScene";




/**
* ...
*/
export class TNavPanel extends TScene
{	

    
	/**
	 * 
	 */
	constructor() 
	{
		super();
		this.init5();
	}
	
	
	/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
	/* ######################################################### */

	public TSceneInitialize() {

        this.TSceneInitialize.call(this);
        this.init5();
    }

    public initialize() {

        this.TSceneInitialize.call(this);		
        this.init5();
    }

    private init5() {

		this.traceMode = true;
		
		if(this.traceMode) CUtil.trace("TScene:Constructor");					
    }

	/* ######################################################### */
	/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


	
	public Destructor() : void
	{
		
		super.Destructor();
	}
    
    

    
	
	
}
	
