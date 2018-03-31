var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var TutorEngineOne;
(function (TutorEngineOne) {
    //** Imports
    /**
    * ...
    */
    var CEFAnimator = /** @class */ (function (_super) {
        __extends(CEFAnimator, _super);
        function CEFAnimator() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.Running = new Array();
            _this.started = 0;
            _this.runCount = 0;
            return _this;
        }
        /**
         * Abstract base class providing object animation features
         */
        CEFAnimator.prototype.CEFAnimator = function () {
        };
        /**
         *
         */
        CEFAnimator.prototype.startTransition = function (xnF) {
            if (xnF === void 0) { xnF = null; }
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("startTransition : " + this.runCount);
            var i1;
            this.xnFinalize = xnF;
            //## Mod Sept 26 2012 - Allow for null transitions - scenes with identical visual instances
            if (this.Running.length == 0) {
                this.xnCleanup();
            }
            // Setup the running array for the transition
            //
            for (var i1_1 = this.started; i1_1 < this.Running.length; i1_1++) {
                this.runCount++;
                this.Running[i1_1].addEventListener(CEFEvent.MOTION_FINISH, this.xnFinished);
                this.Running[i1_1].start();
            }
            // started allows multiple calls to startTran.. without duplicating starts - and inflating runCount 
            // doing multiple starts on a tween would cause runCount to never go back to 0
            this.started = this.runCount;
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Transition Running: ", this.runCount);
        };
        /**
         *
         *## Mod Sept 26 2012 - Allow for null transitions - scenes with identical visual instances
            */
        CEFAnimator.prototype.xnCleanup = function () {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("xn Flush Queue ");
            this.stopTransitions(); // clear the Running array
            //				dispatchEvent(new Event(Event.COMPLETE));	// Tell anyone listening that we are done  @@ removed Nov 17 2008 duplicate of inFinished dispatch
            // invoke the Xition specific finalization 
            //
            if (this.xnFinalize != null)
                this.xnFinalize.call(this);
            // the interface is now in a new state - 
            CEFDoc.gApp.incStateID();
        };
        /**
         *
         */
        CEFAnimator.prototype.xnFinished = function (evt) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("xnFinished : ", this.runCount, evt.currentTarget.obj, evt.currentTarget.obj.name, evt.currentTarget.prop);
            var targTwn = evt.currentTarget;
            var targObj = evt.currentTarget.obj;
            targTwn.stop();
            targTwn.removeEventListener(CEFEvent.MOTION_FINISH, this.xnFinished);
            this.runCount--;
            // If it is comletely transparent, make it invisible. 
            if (targObj.alpha == 0)
                targObj.visible = false;
            // Tell whoever is listening that the scene is ready to run
            //
            if (!this.runCount) {
                //## Mod Sept 26 2012 - Allow for null transitions - scenes with identical visual instances
                this.xnCleanup();
            }
        };
        /**
         *
         */
        CEFAnimator.prototype.stopTransitions = function () {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("stop Transition");
            var i1;
            var runtween;
            // Flush the Running Array
            //
            while (runtween = this.Running.pop()) {
                runtween.removeEventListener(CEFEvent.MOTION_FINISH, this.xnFinished);
                runtween.pause(runtween);
            }
            this.runCount = 0;
            this.started = 0;
        };
        return CEFAnimator;
    }(TutorEngineOne.CEFRoot));
    TutorEngineOne.CEFAnimator = CEFAnimator;
})(TutorEngineOne || (TutorEngineOne = {}));
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
/// <reference path = "CEFAnimator.ts"/>
var TutorEngineOne;
(function (TutorEngineOne) {
    //** Imports
    var Tween = createjs.Tween;
    var ColorMatrixFilter = createjs.ColorMatrixFilter;
    var BlurFilter = createjs.BlurFilter;
    var Ease = createjs.Ease;
    //@@ Bug - Note that tweens start automatically so the push onto the running array should be coupled with a stop 
    //		   to allow us to control the onFinish proc.
    var CEFObject = /** @class */ (function (_super) {
        __extends(CEFObject, _super);
        function CEFObject() {
            var _this = _super.call(this) || this;
            //************ Stage Symbols
            _this.sAuto = "UNKNOWN"; // Is the control in automation mode ?
            _this.satFrames = 8; // default to 8 frames to de/saturate
            _this.satIncrement = 1 / _this.satFrames;
            _this.curSat = 1.0;
            _this.curBlur = 1.0;
            _this.blurFrames = 8; // default to 8 frames to de/saturate
            _this.blurIncrement = 1 / _this.blurFrames;
            _this.curGlow = 1.0;
            _this.glowFrames = 8; // default to 8 frames to de/saturate
            _this.glowIncrement = 1 / _this.glowFrames;
            // general logging properties 
            _this._isvalid = "false";
            _this._ischecked = "false";
            // Object features
            _this._activeFeature = ""; //## Added Mar 29 2013 - to support dynamic features
            _this._validFeature = ""; //## Added Sep 28 2012 - to support dynamic features
            _this._invalidFeature = ""; //## Added Sep 28 2012 - to support dynamic features	
            _this._sceneData = new Object; //## Added Dec 11 2013 - DB based state logging
            _this._phaseData = new Object; //## Added Dec 12 2013 - DB based state logging
            // mask specific values		
            _this._hasClickMask = false;
            _this._hidden = false; // This is the only way to keep object !.visible during a transition 
            _this.onCreateScript = null; // Support for XML based runtime scripting
            _this.onExitScript = null; // Support for XML based runtime scripting
            _this.traceMode = false;
            if (_this.traceMode)
                TutorEngineOne.CUtil.trace("CEFObject:Constructor");
            _this.tweenID = 1; // Instance ID - Identically named objects and ID's will copy deep-state from each other - considered same instance or just shallow state.			
            _this.bTweenable = true; // Objects with the same name will tween together. This flag indicates if the object participates in tweening
            _this.bSubTweenable = false; // Certain objects have subobjects that require tweening - we only do this when we have to - keep tutorAutoObj object as small as possible
            _this.bPersist = false; // Some objects persist throughout the life of the session
            return _this;
        }
        CEFObject.prototype.onCreate = function () {
            // Parse the Tutor.config for create procedures for this scene 
            if ((TutorEngineOne.CEFRoot.gSceneConfig != null) && (TutorEngineOne.CEFRoot.gSceneConfig.objectdata[name] != undefined))
                this.parseOBJ(this, TutorEngineOne.CEFRoot.gSceneConfig.objectdata[name].children(), name);
            //## Mod May 04 2014 - support declarative button actions from scenedescr.xml <create>
            if (this.onCreateScript != null)
                this.doCreateAction();
        };
        CEFObject.prototype.doCreateAction = function () {
            try {
                eval(this.onCreateScript);
            }
            catch (e) {
                TutorEngineOne.CUtil.trace("Error in onCreate script: " + this.onCreateScript);
            }
        };
        CEFObject.prototype.doExitAction = function () {
            if (this.onExitScript != null) {
                try {
                    eval(this.onExitScript);
                }
                catch (e) {
                    TutorEngineOne.CUtil.trace("Error in onExit script: " + this.onExitScript);
                }
            }
        };
        CEFObject.prototype.incFrameNdx = function () {
            CEFObject._framendx++;
        };
        Object.defineProperty(CEFObject.prototype, "hidden", {
            get: function () {
                return this._hidden;
            },
            /**
             * This is a mechanism to keep woz objects !.visible through a transition
             *
             */
            set: function (hide) {
                this._hidden = hide;
                if (this._hidden) {
                    this.visible = false;
                    this.alpha = 0;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFObject.prototype, "features", {
            get: function () {
                return this._features;
            },
            set: function (newFTR) {
                this._features = newFTR;
            },
            enumerable: true,
            configurable: true
        });
        CEFObject.prototype.setANDFeature = function (newFTR) {
            if (this._features.length != 0)
                this._features += ",";
            this._features += newFTR;
        };
        CEFObject.prototype.setORFeature = function (newFTR) {
            if (this._features.length != 0)
                this._features += ":";
            this._features += newFTR;
        };
        CEFObject.prototype.unSetFeature = function (ftr) {
            var feature;
            var featArray = new Array;
            var updatedFTRset = "";
            if (this._features.length > 0)
                featArray = this._features.split(":");
            // Add instance features 
            for (var _i = 0, featArray_1 = featArray; _i < featArray_1.length; _i++) {
                var feature_1 = featArray_1[_i];
                if (feature_1 != ftr) {
                    if (updatedFTRset.length != 0)
                        updatedFTRset += ":";
                    updatedFTRset += ftr;
                }
            }
            this._features = updatedFTRset;
        };
        //*************** Dynamic object creation
        CEFObject.prototype.buildObject = function (objectClass, objectName) {
            var newObject;
            var maskDim;
            var ClassRef = this.getDefinitionByName(objectClass);
            newObject = new ClassRef();
            newObject.name = objectName;
            newObject.onCreate(); // perform object initialization
            //			iniVisible = newObject.visible;
            //			
            //			newObject.visible = false;
            this.addChild(newObject);
            if (newObject._hasClickMask) {
                maskDim = newObject.globalToLocal(0, 0);
                newObject.SclickMask.x = maskDim.x;
                newObject.SclickMask.y = maskDim.y;
                newObject.SclickMask.graphics.setStrokeStyle(0); // we don't need a border so leave default - NaN
                newObject.SclickMask.graphics.beginFill(newObject._maskColor); //, newObject._maskAlpha);
                newObject.SclickMask.graphics.drawRect(0, 0, CEFObject.STAGEWIDTH, CEFObject.STAGEHEIGHT);
                newObject.SclickMask.graphics.endFill();
            }
            return newObject;
        };
        /*
        *
        */
        CEFObject.prototype.buildMask = function () {
        };
        Object.defineProperty(CEFObject.prototype, "activeFeature", {
            get: function () {
                return "";
            },
            set: function (value) {
            },
            enumerable: true,
            configurable: true
        });
        //*************** Effect management - from Audio Stream
        CEFObject.prototype.clearAllEffects = function (fHide) {
            if (fHide === void 0) { fHide = true; }
            this.stopTransitions();
            removeEventListener(CEFEvent.ENTER_FRAME, this.saturationTimer);
            removeEventListener(CEFEvent.ENTER_FRAME, this.blurTimer);
            removeEventListener(CEFEvent.ENTER_FRAME, this.flashTimer);
            this.filters = null;
            if (fHide)
                this.alpha = 0;
        };
        /**
         *
         */
        CEFObject.prototype.moveChild = function (tarObj, moveX, moveY, duration) {
            if (duration === void 0) { duration = "0.5"; }
            // push the tweens on to the run stack 
            //
            if (moveX != "")
                this.Running.push(new Tween(this[tarObj]).to({ x: moveX }, Number(duration), Ease.cubicInOut));
            if (moveY != "")
                this.Running.push(new Tween(this[tarObj]).to({ y: moveY }, Number(duration), Ease.cubicInOut));
        };
        /**
         *
         */
        CEFObject.prototype.moveOriginChild = function (tarObj, regx, regy, duration) {
            if (duration === void 0) { duration = "0.5"; }
            // push the tweens on to the run stack 
            //
            if (regx != "")
                this.Running.push(new Tween(this[tarObj]).to({ regX: regx }, Number(duration), Ease.cubicInOut));
            if (regy != "")
                this.Running.push(new Tween(this[tarObj]).to({ regY: regy }, Number(duration), Ease.cubicInOut));
        };
        /**
         *
         */
        CEFObject.prototype.scaleChild = function (tarObj, scalex, scaley, duration) {
            if (duration === void 0) { duration = "0.5"; }
            // push the tweens on to the run stack 
            //
            if (scalex != "")
                this.Running.push(new Tween(this[tarObj]).to({ scaleX: scalex }, Number(duration), Ease.cubicInOut));
            if (scaley != "")
                this.Running.push(new Tween(this[tarObj]).to({ scaleY: scaley }, Number(duration), Ease.cubicInOut));
        };
        /**
         *@@ TODO: Check if this needs to be incorporated into the pause mechanism
            */
        CEFObject.prototype.saturateChild = function (tarObj, newState, duration) {
            if (duration === void 0) { duration = "0.08"; }
            this[tarObj].saturateObj(newState, duration);
        };
        /**
         *@@ TODO: Check if this needs to be incorporated into the pause mechanism
            */
        CEFObject.prototype.saturateChildTo = function (tarObj, newSat, duration) {
            if (duration === void 0) { duration = "0.08"; }
            this[tarObj].saturateObjTo(newSat, duration);
        };
        /**
         *@@ TODO: Check if this needs to be incorporated into the pause mechanism
            */
        CEFObject.prototype.saturateObj = function (newState, duration) {
            if (duration === void 0) { duration = "0.08"; }
            this.newSaturation = newState;
            if (this.newSaturation == "mono") {
                this.curSat = 1.0;
                this.newSat = 0.0;
            }
            else {
                this.curSat = 0.0;
                this.newSat = 1.0;
            }
            this.satIncrement = 1.0 / 12;
            addEventListener(CEFEvent.ENTER_FRAME, this.saturationTimer);
        };
        /**
         *@@ TODO: Check if this needs to be incorporated into the pause mechanism
            */
        CEFObject.prototype.saturateObjTo = function (_newSat, duration) {
            if (duration === void 0) { duration = "0.08"; }
            var dynRange;
            if (_newSat > this.curSat) {
                this.newSaturation = "color";
            }
            else {
                this.newSaturation = "mono";
            }
            this.newSat = _newSat;
            dynRange = Math.abs(_newSat - this.curSat);
            this.satIncrement = dynRange / 12;
            addEventListener(CEFEvent.ENTER_FRAME, this.saturationTimer);
        };
        /**
         *
         */
        CEFObject.prototype.saturationTimer = function (evt) {
            // If transitioning to full saturation - incrementally increase the sat level
            if (this.newSaturation == "color") {
                this.curSat += this.satIncrement;
                if (this.curSat >= this.newSat) {
                    this.curSat = this.newSat;
                    removeEventListener(CEFEvent.ENTER_FRAME, this.saturationTimer);
                }
            }
            else if (this.newSaturation == "mono") {
                this.curSat -= this.satIncrement;
                if (this.curSat <= this.newSat) {
                    this.curSat = this.newSat;
                    removeEventListener(CEFEvent.ENTER_FRAME, this.saturationTimer);
                }
            }
            else {
                this.curSat = 1.0;
                removeEventListener(CEFEvent.ENTER_FRAME, this.saturationTimer);
            }
            this.filters = new Array(this.adjustSaturation(Number(this.curSat)));
        };
        /**
         * Function: adjustSaturation
         *
         * Parameters:
         * s - typical values come in the range 0.0 ... 2.0 where
         * 0.0 means 0% Saturation
         * 0.5 means 50% Saturation
         * 1.0 is 100% Saturation (aka no change)
         * 2.0 is 200% Saturation
         *
         * Other values outside of this range are possible
         * -1.0 will invert the hue but keep the luminance
         *
         */
        CEFObject.prototype.adjustSaturation = function (s) {
            if (s === void 0) { s = 1; }
            var sInv;
            var irlum;
            var iglum;
            var iblum;
            sInv = (1 - s);
            irlum = (sInv * CEFObject.LUMA_R);
            iglum = (sInv * CEFObject.LUMA_G);
            iblum = (sInv * CEFObject.LUMA_B);
            return new ColorMatrixFilter([(irlum + s), iglum, iblum, 0, 0,
                irlum, (iglum + s), iblum, 0, 0,
                irlum, iglum, (iblum + s), 0, 0,
                0, 0, 0, 1, 0]);
        };
        /**
         *@@ TODO: Check if this needs to be incorporated into the pause mechanism
            */
        CEFObject.prototype.blurChild = function (tarObj, duration) {
            if (duration === void 0) { duration = "12"; }
            this[tarObj].blurObj(duration);
        };
        /**
         *@@ TODO: Check if this needs to be incorporated into the pause mechanism
            */
        CEFObject.prototype.blurObj = function (duration) {
            if (duration === void 0) { duration = "12"; }
            this.blurIncrement = 255.0 / Number(duration);
            this.curBlur = 0;
            addEventListener(CEFEvent.ENTER_FRAME, this.blurTimer);
        };
        /**
         *
         */
        CEFObject.prototype.blurTimer = function (evt) {
            // If transitioning to full saturation - incrementally increase the sat level
            this.curBlur += this.blurIncrement;
            if (this.curBlur >= 255) {
                removeEventListener(CEFEvent.ENTER_FRAME, this.blurTimer);
                dispatchEvent(new Event("blur_complete"));
                this.filters = null;
                this.alpha = 0;
            }
            else
                this.filters = new Array(new BlurFilter(this.curBlur, this.curBlur));
        };
        /**
         *@@ TODO: Check if this needs to be incorporated into the pause mechanism
            */
        CEFObject.prototype.flashChild = function (tarObj, _glowColor, duration) {
            if (duration === void 0) { duration = "8"; }
            this[tarObj].flashObj(_glowColor, duration);
        };
        /**
         *@@ TODO: Check if this needs to be incorporated into the pause mechanism
            */
        CEFObject.prototype.flashObj = function (_glowColor, duration) {
            if (duration === void 0) { duration = "8"; }
            this.glowStage = "color";
            this.glowColor = _glowColor;
            this.glowStrength = 2.0;
            this.glowAlpha = 1.0;
            this.glowIncrement = 175.0 / Number(duration);
            this.curGlow = 0;
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("start Object Flash");
            addEventListener(CEFEvent.ENTER_FRAME, this.flashTimer);
        };
        /**
         *
         */
        CEFObject.prototype.flashTimer = function (evt) {
            if (this.glowStage == "color") {
                this.curGlow += this.glowIncrement;
                this.glowStrength += .1;
                if (this.curGlow >= 175) {
                    this.glowStage = "alpha";
                }
            }
            else if (this.glowStage == "alpha") {
                if (this.glowAlpha <= 0.0) {
                    if (this.traceMode)
                        TutorEngineOne.CUtil.trace("end Object Flash");
                    removeEventListener(CEFEvent.ENTER_FRAME, this.flashTimer);
                    dispatchEvent(new Event("glow_complete"));
                    this.glowStage = "done";
                    this.filters = null;
                }
                this.glowAlpha -= .05;
            }
            // if(this.glowStage != "done")
            // 	this.filters = new Array(new GlowFilter(glowColor, glowAlpha, curGlow,curGlow, glowStrength));			
        };
        /**
         *
         */
        CEFObject.prototype.showChild = function (tarObj, alphaTo, autoStart) {
            if (alphaTo === void 0) { alphaTo = -1; }
            if (autoStart === void 0) { autoStart = false; }
            // push the tweens on to the run stack 
            //
            this[tarObj].visible = true;
            if (alphaTo != -1)
                this[tarObj].alpha = alphaTo;
        };
        /**
         *
         */
        CEFObject.prototype.hideChild = function (tarObj) {
            // push the tweens on to the run stack 
            //
            this[tarObj].visible = false;
        };
        /**
         *
         */
        CEFObject.prototype.fadeChildOff = function (tarObj, autoStart, duration) {
            if (autoStart === void 0) { autoStart = false; }
            if (duration === void 0) { duration = "0.5"; }
            this._tarObj = tarObj;
            this.Running.push(new Tween(this[tarObj]).to({ alpha: 0 }, Number(duration), Ease.cubicInOut));
            if (autoStart)
                this.startTransition(this.hideDone);
        };
        /**
         * Object specific finalization behaviors - invoked through  reference in xnFinished
         */
        CEFObject.prototype.hideDone = function () {
            this[this._tarObj].visible = false;
        };
        /**
         *
         */
        CEFObject.prototype.fadeChild = function (tarObj, alphaTo, autoStart, duration) {
            if (autoStart === void 0) { autoStart = false; }
            if (duration === void 0) { duration = "0.5"; }
            // push the tweens on to the run stack 
            //
            this[tarObj].visible = true;
            switch (alphaTo) {
                case "off":
                case "on":
                    if (this.traceMode)
                        TutorEngineOne.CUtil.trace("Fading : ", tarObj, alphaTo);
                    this.Running.push(new Tween(this[tarObj]).to({ alpha: (alphaTo == "on") ? 1 : 0 }, Number(duration), Ease.cubicInOut));
                    if (autoStart == true)
                        this.startTransition(this.twnDone);
                    break;
                default:
                    if (this.traceMode)
                        TutorEngineOne.CUtil.trace("fadeChild: Parameter error - should be 'on' or 'off' - is: ", alphaTo);
                    break;
            }
        };
        /**
         *
         */
        CEFObject.prototype.fadeChildTo = function (tarObj, alphaTo, autoStart, duration) {
            if (autoStart === void 0) { autoStart = false; }
            if (duration === void 0) { duration = "0.5"; }
            // push the tweens on to the run stack 
            //
            this[tarObj].visible = true;
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Fading To: ", tarObj, alphaTo);
            this.Running.push(new Tween(this[tarObj]).to({ alpha: alphaTo }, Number(duration), Ease.cubicInOut));
            if (autoStart == true)
                this.startTransition(this.twnDone);
        };
        /**
         * Object specific finalization behaviors - invoked through  reference in xnFinished
         */
        CEFObject.prototype.twnDone = function () {
        };
        /**
         *
         */
        CEFObject.prototype.startTween = function (xnF) {
            if (xnF === void 0) { xnF = this.twnDone; }
            if (this.Running.length > 0)
                this.startTransition((xnF == null) ? this.twnDone : xnF);
        };
        //*************** Effect management - from Audio Stream
        //*************** Deep state management
        CEFObject.prototype.deepStateCopy = function (src) {
            this.rotation = src.rotation;
            this.x = src.x;
            this.y = src.y;
            this.scaleX = src.scaleX;
            this.scaleY = src.scaleY;
            this.alpha = src.alpha;
            this.visible = src.visible;
            this.bPersist = src.bPersist;
            this.activeFeature = src.activeFeature;
        };
        CEFObject.prototype.shallowStateCopy = function (tar, src) {
            tar.rotation = src.rotation;
            tar.x = src.x;
            tar.y = src.y;
            tar.scaleX = src.scaleX;
            tar.scaleY = src.scaleY;
            tar.alpha = src.alpha;
            tar.visible = src.visible;
        };
        //*************** Deep state management
        // Walk the WOZ Objects to capture their default state
        //
        CEFObject.prototype.captureDefState = function (tutObject) {
            this.defRot = this.rotation;
            this.defX = this.x;
            this.defY = this.y;
            this.defWidth = this.scaleX;
            this.defHeight = this.scaleY;
            this.defAlpha = this.alpha;
            for (var subObject in tutObject) {
                if (subObject != "instance" && tutObject[subObject].instance instanceof CEFObject) {
                    if (this.traceMode)
                        TutorEngineOne.CUtil.trace("capturing: " + tutObject[subObject].instance.name);
                    tutObject[subObject].instance.captureDefState(tutObject[subObject]);
                }
            }
        };
        // Walk the WOZ Objects to restore their default state
        //
        CEFObject.prototype.restoreDefState = function (tutObject) {
            this.rotation = this.defRot;
            this.scaleX = this.defWidth;
            this.scaleY = this.defHeight;
            this.x = this.defX;
            this.y = this.defY;
            this.alpha = this.defAlpha;
            for (var subObject in tutObject) {
                if (subObject != "instance" && tutObject[subObject].instance instanceof CEFObject) {
                    if (this.traceMode)
                        TutorEngineOne.CUtil.trace("restoring: " + tutObject[subObject].instance.name);
                    tutObject[subObject].instance.restoreDefState(tutObject[subObject]);
                }
            }
        };
        CEFObject.prototype.isTweenable = function () {
            return this.bTweenable;
        };
        CEFObject.prototype.isSubTweenable = function () {
            return this.bSubTweenable;
        };
        //*************** Logging state management
        CEFObject.prototype.captureLogState = function (obj) {
            if (obj === void 0) { obj = null; }
            if (obj == null)
                obj = new Object;
            return obj;
        };
        CEFObject.prototype.captureXMLState = function () {
            var nullXML = '<null/>';
            return nullXML;
        };
        CEFObject.prototype.restoreXMLState = function (xmlState) {
        };
        CEFObject.prototype.compareXMLState = function (xmlState) {
            return false;
        };
        CEFObject.prototype.createLogAttr = function (objprop, restart) {
            if (restart === void 0) { restart = false; }
            var sResult;
            if (!this.hasOwnProperty(objprop))
                sResult = "undefined";
            else
                sResult = this[objprop];
            return sResult;
        };
        //*************** Logging state management
        //***************** Automation *******************************
        /**
         * Designed to be overridden by objects that require redraw in order for their size to be determined
         * e.g. CEFRect
         *
         */
        CEFObject.prototype.measure = function () {
        };
        CEFObject.prototype.initAutomation = function (_parentScene, sceneObj, ObjIdRef, lLogger, lTutor) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("CEFObject initAutomation:");
            // parse all the component objects - NOTE: everything must be derived from CEFObject
            //
            var subObj;
            var wozObj;
            this.objID = ObjIdRef + name; // set the objects ID
            for (var i1 = 0; i1 < this.numChildren; i1++) {
                subObj = this.getChildAt(i1);
                // Record each Sub-Object - only maintain pointers
                //
                sceneObj[subObj.name] = new Object;
                sceneObj[subObj.name].instance = subObj;
                // Have Object determine its inplace size
                //
                if (subObj instanceof CEFObject || subObj instanceof CEFObjectDyno) {
                    //## Mod Apr 14 2014 - maintain linkage to parent scene - used for D.eval execution context - e.g. button script execution
                    subObj.parentScene = _parentScene;
                    if (subObj instanceof CEFObject)
                        subObj.measure();
                }
                // Record object in-place position - This is only done for top level objects in scene to record their inplace positions 
                // for inter-scene tweening.
                //
                sceneObj[subObj.name]['inPlace'] = { X: subObj.x, Y: subObj.y, Width: subObj.scaleX, Height: subObj.scaleY, Alpha: subObj.alpha };
                if (this.traceMode)
                    TutorEngineOne.CUtil.trace("\t\tCEFObject found subObject named:" + subObj.name);
                // Recurse WOZ Children
                //
                if (subObj instanceof CEFObject) {
                    wozObj = subObj; // Coerce the Object					
                    wozObj.initAutomation(_parentScene, sceneObj[subObj.name], this.objID + ".", lLogger, lTutor);
                }
                // Recurse WOZ Children
                //
                if (subObj instanceof CEFObjectDyno) {
                    var wozDynoObj = subObj; // Coerce the Object					
                    wozDynoObj.initAutomation(_parentScene, sceneObj[subObj.name], this.objID + ".", lLogger, lTutor);
                }
            }
        };
        // Walk the WOZ Objects to initialize their automation mode
        // to do any special initialization - but call super to propogate
        //
        CEFObject.prototype.setAutomationMode = function (sceneObj, sMode) {
            // Initialize the mode variable
            //
            this.sAuto = sMode;
            // Propogate to any children
            //
            for (var subObj in sceneObj) {
                if (subObj != "instance" && sceneObj[subObj].instance instanceof CEFObject) {
                    sceneObj[subObj].instance.setAutomationMode(sceneObj[subObj], sMode);
                }
            }
        };
        //***************** Automation *******************************		
        //***************** Debug *******************************		
        CEFObject.prototype.dumpSubObjs = function (sceneObj, Indent) {
            for (var subObj in sceneObj) {
                if (this.traceMode)
                    TutorEngineOne.CUtil.trace(Indent + "\tsubObj : " + subObj);
                if (subObj != "instance") {
                    var ObjData = sceneObj[subObj]; // Convenience Pointer
                    if (sceneObj[subObj].instance instanceof CEFObject) {
                        if (this.traceMode)
                            TutorEngineOne.CUtil.trace(Indent + "\t");
                        var wozObj = sceneObj[subObj].instance;
                        if (ObjData['inPlace'] != undefined) {
                            if (this.traceMode)
                                TutorEngineOne.CUtil.trace(Indent + "\tCEF* Object: " + " x: " + wozObj.x + " y: " + wozObj.y + " width: " + wozObj.scaleX + " height: " + wozObj.scaleY + " alpha: " + wozObj.alpha + " visible: " + wozObj.visible + " name: " + wozObj.name);
                            if (this.traceMode)
                                TutorEngineOne.CUtil.trace(Indent + "\tIn-Place Pos: " + " X: " + ObjData['inPlace'].X + " Y: " + ObjData['inPlace'].Y + " Width: " + ObjData['inPlace'].scaleX + " Height: " + ObjData['inPlace'].scaleY + " Alpha: " + ObjData['inPlace'].Alpha);
                        }
                        sceneObj[subObj].instance.dumpSubObjs(sceneObj[subObj], Indent + "\t");
                    }
                    else {
                        var disObj = sceneObj[subObj].instance;
                        if (ObjData['inPlace'] != undefined) {
                            if (this.traceMode)
                                TutorEngineOne.CUtil.trace(Indent + "\tFlash Object: " + " x: " + disObj.x + " y: " + disObj.y + " width: " + disObj.scaleX + " height: " + disObj.scaleY + " alpha: " + disObj.alpha + " visible: " + disObj.visible + " name: " + disObj.name);
                            if (this.traceMode)
                                TutorEngineOne.CUtil.trace(Indent + "\tIn-Place Pos: " + " X: " + ObjData['inPlace'].X + " Y: " + ObjData['inPlace'].Y + " Width: " + ObjData['inPlace'].scaleX + " Height: " + ObjData['inPlace'].scaleY + " Alpha: " + ObjData['inPlace'].Alpha);
                        }
                    }
                }
                else {
                    if (this.traceMode)
                        TutorEngineOne.CUtil.trace(Indent + "Parent Object : " + sceneObj + " visible: " + sceneObj[subObj].visible);
                }
            }
        };
        Object.defineProperty(CEFObject.prototype, "isChecked", {
            get: function () {
                return this._ischecked;
            },
            set: function (sval) {
                this._ischecked = sval;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFObject.prototype, "checked", {
            get: function () {
                return (this._ischecked == "true") ? true : false;
            },
            set: function (bval) {
                this._ischecked = (bval) ? "true" : "false";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFObject.prototype, "isValid", {
            get: function () {
                return this._isvalid;
            },
            set: function (sval) {
                this._isvalid = sval;
            },
            enumerable: true,
            configurable: true
        });
        CEFObject.prototype.assertFeatures = function () {
            return "";
        };
        CEFObject.prototype.retractFeatures = function () {
        };
        Object.defineProperty(CEFObject.prototype, "tallyValid", {
            get: function () {
                return "0";
            },
            enumerable: true,
            configurable: true
        });
        CEFObject.prototype.assertFeature = function (_feature) {
            if (_feature != "")
                TutorEngineOne.CEFRoot.gTutor.addFeature = _feature;
        };
        CEFObject.prototype.retractFeature = function (_feature) {
            if (_feature != "")
                TutorEngineOne.CEFRoot.gTutor.delFeature = _feature;
        };
        //****************** START Globals		
        CEFObject.initGlobals = function () {
            CEFObject._globals = new Object;
        };
        CEFObject.prototype.incrGlobal = function (_id, _max, _cycle) {
            if (_max === void 0) { _max = -1; }
            if (_cycle === void 0) { _cycle = 0; }
            var result;
            if (CEFObject._globals.hasOwnProperty(_id)) {
                CEFObject._globals[_id]++;
                result = CEFObject._globals[_id];
                // Roll over at max value > -1 will never roll
                if (CEFObject._globals[_id] == _max)
                    CEFObject._globals[_id] = _cycle;
            }
            else
                result = CEFObject._globals[_id] = 1;
            return result;
        };
        CEFObject.prototype.assertGlobal = function (_id, _value) {
            CEFObject._globals[_id] = _value;
        };
        CEFObject.prototype.retractGlobal = function (_id) {
            CEFObject._globals[_id] = "";
        };
        CEFObject.prototype.queryGlobal = function (_id) {
            var result;
            if (CEFObject._globals.hasOwnProperty(_id)) {
                result = CEFObject._globals[_id];
            }
            else
                result = "null";
            return result;
        };
        Object.defineProperty(CEFObject.prototype, "globals", {
            get: function () {
                return CEFObject._globals;
            },
            set: function (gval) {
                CEFObject._globals = gval;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFObject.prototype, "valid", {
            get: function () {
                return (this._isvalid == "true") ? true : false;
            },
            //****************** END Globals		
            set: function (bval) {
                this._isvalid = (bval) ? "true" : "false";
            },
            enumerable: true,
            configurable: true
        });
        //***************** Debug *******************************		
        //***********  Live behaviors
        //***********  WOZ event stream - WOZ controls only listen for these events
        CEFObject.prototype.wozMouseClick = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozMouseMove = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozMouseDown = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozMouseUp = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozMouseOver = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozMouseOut = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozKeyDown = function (evt) {
            this.dispatchEvent(evt);
        };
        CEFObject.prototype.wozKeyUp = function (evt) {
            this.dispatchEvent(evt);
        };
        //*************** overridable functions - polymorphic behaviors
        //*************** Creation / Initialization
        /**
         *
         * @param	baseObj
         * @param	objArray
         * @return
         */
        CEFObject.prototype.decodeTarget = function (baseObj, objArray) {
            var tmpObject = baseObj;
            var subObject;
            subObject = objArray.shift();
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("decoding: " + subObject);
            if (subObject != "this") {
                tmpObject = baseObj[subObject];
                if (objArray.length)
                    tmpObject = this.decodeTarget(tmpObject, objArray);
            }
            return tmpObject;
        };
        /**
         *
         * @param	tarObj
         * @param	tarXML
         */
        CEFObject.prototype.parseOBJLog = function (tarObj, element) {
            var objArray;
            var dataStr;
            var attrName;
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Processing: " + element.localName() + " - named: " + element.named);
            objArray = element.objname.split(".");
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Target Array: " + objArray[0]);
            if (objArray.length)
                tarObj = this.decodeTarget(tarObj, objArray);
            //@@ Mod Jun 03 2013 - Support for method based logging
            //
            // If there is a single property process it
            if (element.objprop != undefined) {
                // process the logging instruction
                //@@ Mod Mar 13 2012 - removed phase and use @logid as direct child of state - avoids conflict with deprecated logging
                //                     method used in tutor
                dataStr = tarObj.createLogAttr(element.objprop);
            }
            else if (element.objmethod != undefined) {
                dataStr = tarObj.runXMLFunction(tarObj, element);
            }
            // NOTE: Phase State Attribute names: 
            // currently simplified frameid + scenename + logattr + iteration
            // TODO: support graph style encoding see framendx definition above for details
            // Construct the unique log attribute name - 			
            attrName = this.constructLogName(element.logattr);
            this.navigator._phaseData[attrName] = new Object;
            // update the phase specific log data - save in log progress packet - uses compound attribute name			
            this.navigator._phaseData[attrName]['value'] = dataStr;
            this.navigator._phaseData[attrName]["start"] = TutorEngineOne.CEFRoot.gTutor.timeStamp.getStartTime("dur_" + name);
            this.navigator._phaseData[attrName]["duration"] = TutorEngineOne.CEFRoot.gTutor.timeStamp.createLogAttr("dur_" + name);
            // Simple Scene state record - some values set in CEFSceneSequence.onExitScene 
            this._sceneData[element.logattr] = dataStr;
            // NOTE: if you don't use toString it will emit an XMLList object for some unknown reason.
            this._sceneData['phasename'] = element.logid.toString();
            try {
                this._sceneData['Rule0'] = TutorEngineOne.CEFRoot.gTutor.ktSkills['rule0'].queryBelief();
                this._sceneData['Rule1'] = TutorEngineOne.CEFRoot.gTutor.ktSkills['rule1'].queryBelief();
                this._sceneData['Rule2'] = TutorEngineOne.CEFRoot.gTutor.ktSkills['rule2'].queryBelief();
            }
            catch (err) {
                TutorEngineOne.CUtil.trace("Error - CVS Skills not defined:" + err);
            }
            // Use this if you want to keep kt history data centralized in the user account
            //			
            //			try
            //			{
            //				if(navigator._phaseData.skills == null)
            //					navigator._phaseData.skills = new Object;
            //				
            //				attrName = constructLogName("Rule0");
            //				navigator._phaseData.skills[attrName] = gTutor.ktSkills["rule0"].queryBelief();			
            //				
            //				attrName = constructLogName("Rule1");
            //				navigator._phaseData.skills[attrName] = gTutor.ktSkills["rule1"].queryBelief();						
            //				
            //				attrName = constructLogName("Rule2");
            //				navigator._phaseData.skills[attrName] = gTutor.ktSkills["rule2"].queryBelief();			
            //			}
            //			catch(err:Error)
            //			{
            //				trace("Error - CVS Rules not defined: 2" + err);
            //			}
            return;
        };
        /**
         *
         */
        CEFObject.prototype.constructLogName = function (attr) {
            var attrName = "L00000";
            var frame;
            frame = CEFObject._framendx.toString();
            // Note: name here is the scene name itself which is the context in which we are executing
            //attrName = attrName.slice(0, 6-frame.length) + frame + "_" + name +"_" + attr + "_" + gTutor.gNavigator.iteration.toString(); 
            attrName = name + "_" + attr + "_" + TutorEngineOne.CEFRoot.gTutor.gNavigator.iteration.toString();
            return attrName;
        };
        /**
         *
         * @param	tarObj
         * @param	tarXML
         */
        CEFObject.prototype.setXMLProperty = function (tarObj, tarXML) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Processing: " + tarXML.localName() + " - named: " + tarXML.named + "- value: " + tarXML.value);
            if (tarObj.hasOwnProperty(tarXML.prop)) {
                // This sequence of conversions is critical for correct type assignments (automatic conversions - see built in types e.g Boolean)
                var parmDef = tarXML.value.split(":");
                if (parmDef[1] != "null") {
                    //## Mod Feb 16 2012 - added support for array of comma delimited string initializers
                    if (parmDef[1] == "Array") {
                        tarObj[tarXML.prop] = parmDef[0].split(",");
                    }
                    else {
                        var tClass = this.getDefinitionByName(parmDef[1]);
                        var value = parmDef[0];
                        tarObj[tarXML.prop] = new tClass(value);
                    }
                }
                else
                    tarObj[tarXML.prop] = null;
            }
        };
        /**
         *
         * @@ Mod Jun 03 2013 - Support return values. For logging
         *
         * @param	tarObj
         * @param	tarXML
         */
        CEFObject.prototype.runXMLFunction = function (tarObj, tarXML) {
            var i1 = 1;
            var tClass;
            var value;
            var objArray;
            var parmDef;
            var parms = new Array;
            // unmarshal the typed parameter array from the XML representation
            while (tarXML["parm" + i1] != undefined) {
                parmDef = tarXML["parm" + i1].split(":");
                // A displayobject on stage
                if (parmDef[1] == "symbol") {
                    objArray = parmDef[0].split(".");
                    if (objArray.length)
                        parms.push(this.decodeTarget(tarObj, objArray));
                }
                else if (parmDef[1] != "null") {
                    tClass = this.getDefinitionByName(parmDef[1]);
                    value = parmDef[0];
                    parms.push(new tClass(value));
                }
                else
                    parms.push(null);
                i1++;
            }
            // Apply the command - this expands the parameter array
            if (tarXML.cmnd != undefined)
                return tarObj[tarXML.cmnd].apply(tarObj, (parms));
            if (tarXML.objmethod != undefined)
                return tarObj[tarXML.objmethod].apply(tarObj, (parms));
        };
        /**
         *
         * @param	tarObj
         * @param	tarXML
         */
        CEFObject.prototype.parseOBJ = function (tarObj, tarXML, xType) {
            var tarObject;
            var childList;
            var objArray;
            var element;
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Parsing:" + tarXML[0].localName() + " - named: " + tarXML[0].named + " - Count: " + tarXML.length());
            for (var _i = 0, tarXML_1 = tarXML; _i < tarXML_1.length; _i++) {
                element = tarXML_1[_i];
                // reset tarObject - it may change on each iteration
                tarObject = tarObj;
                // If initializer is featured - execute matching features
                if (element.features != undefined) {
                    // Each element of the fFeature vector contains an id for a feature of the tutor.
                    // This permits the tutor to have multiple independently managed features.
                    // All identifiers of all the feature sets must be globally unique.
                    if (!TutorEngineOne.CEFRoot.gTutor.testFeatureSet(String(element.features)))
                        continue;
                }
                try {
                    switch (element.localName()) {
                        case "common":
                            this.parseOBJ(tarObj, CEFObject.gSceneConfig.scenedata[element.text()][xType].children(), xType);
                            break;
                        case "log":
                            this.parseOBJLog(tarObject, element);
                            break;
                        case "obj":
                            if (this.traceMode)
                                TutorEngineOne.CUtil.trace("Processing: " + element.localName() + " - named: " + element.named);
                            try {
                                objArray = element.named.split(".");
                                if (this.traceMode)
                                    TutorEngineOne.CUtil.trace("Target Array: " + objArray[0]);
                                if (objArray.length)
                                    tarObject = this.decodeTarget(tarObject, objArray);
                                // process any children if they exist
                                childList = element.children();
                                if (childList.length > 0)
                                    this.parseOBJ(tarObject, childList, "obj");
                                // If there is a single property process it now
                                if (element.prop != undefined) {
                                    this.setXMLProperty(tarObject, element);
                                }
                                else if (element.cmnd != undefined) {
                                    this.runXMLFunction(tarObject, element);
                                }
                            }
                            catch (err) {
                                if (this.traceMode)
                                    TutorEngineOne.CUtil.trace("Invalid 'obj' target");
                            }
                            break;
                        case "props":
                            if (this.traceMode)
                                TutorEngineOne.CUtil.trace("Processing: " + element.localName() + " - named: " + element.named + "- value: " + element.value);
                            this.setXMLProperty(tarObject, element);
                            break;
                        case "cmnds":
                            if (this.traceMode)
                                TutorEngineOne.CUtil.trace("Processing: " + element.localName() + " - named: " + element.named + "- value: " + element.value);
                            this.runXMLFunction(tarObject, element);
                            break;
                        case "symbol":
                            //@@ mod Jan 22 2013 - enhanced to support nested children
                            try {
                                objArray = element.named.split(".");
                                if (this.traceMode)
                                    TutorEngineOne.CUtil.trace("Target Array: " + objArray[0]);
                                if (objArray.length)
                                    tarObject = this.decodeTarget(tarObject, objArray);
                            }
                            catch (err) {
                                TutorEngineOne.CUtil.trace("ParseXML Symbol named: " + element.named + " not found.");
                                tarObject = null;
                            }
                            if (tarObject != null) {
                                tarObject.loadXML(element);
                            }
                            break;
                        case "object":
                            if (this.hasOwnProperty(element.named) && (this[element.named] != null))
                                this[element.named].parseXML(this[element.named], CEFObject.gSceneConfig.objectdata[element.named].children(), "object");
                            break;
                        case "initself":
                            this.loadXML(element);
                            break;
                    }
                }
                catch (err) {
                    TutorEngineOne.CUtil.trace("CEFObject:parseXML: " + err);
                }
            }
        };
        /*
        *
        */
        CEFObject.prototype.loadOBJ = function (xmlSrc) {
            // Keep a pointer to the object spec
            this._XMLsrc = xmlSrc;
            if (xmlSrc.wozname != undefined)
                this.wozName = xmlSrc.wozname;
            if (xmlSrc.x != undefined)
                this.x = Number(xmlSrc.x);
            if (xmlSrc.y != undefined)
                this.y = Number(xmlSrc.y);
            if (xmlSrc.visible != undefined) {
                this.visible = (xmlSrc.visible == "true") ? true : false;
            }
            if (xmlSrc.alpha != undefined)
                this.alpha = Number(xmlSrc.alpha);
            if (xmlSrc.mask != undefined) {
                this._hasClickMask = true;
                // this.SclickMask = new Sprite;
                this.addChildAt(this.SclickMask, 0);
                // this._maskColor = Number(xmlSrc.mask.color);
                // this._maskAlpha = Number(xmlSrc.mask.alpha);
            }
            if (xmlSrc.oncreate != undefined) {
                try {
                    // Note: it is imperitive that we precompile the script -
                    //       Doing it on each invokation causes failures
                    // onCreateScript = D.parseProgram(xmlSrc.oncreate);
                }
                catch (err) {
                    TutorEngineOne.CUtil.trace("Error: onCreateScript Invalid: " + xmlSrc.oncreate);
                }
            }
            if (xmlSrc.onexit != undefined) {
                try {
                    // Note: it is imperitive that we precompile the script -
                    //       Doing it on each invokation causes failures
                    // onExitScript = D.parseProgram(xmlSrc.onexit);
                }
                catch (err) {
                    TutorEngineOne.CUtil.trace("Error: onExitScript Invalid: " + xmlSrc.onExitScript);
                }
            }
            _super.prototype.loadXML.call(this, xmlSrc);
        };
        //*************** Navigator static constants
        CEFObject.CANCELNAV = "CancelNav";
        CEFObject.OKNAV = "OK";
        // RGB to Luminance conversion constants
        CEFObject.LUMA_R = 0.212671;
        CEFObject.LUMA_G = 0.71516;
        CEFObject.LUMA_B = 0.072169;
        CEFObject._globals = new Object; //## Added Sep 23 2013 - to support global variables
        // Global logging support - each scene instance and subscene animation instance represent 
        //                          object instances in the log.
        //                          The frameid is a '.' delimited string representing the:
        //
        //     framendx:graphnode.nodemodule.moduleelement... :animationnode.animationelement...iterationNdx
        //
        //			Semantics - each ':' represents the root of a new different (sub)graph	
        //  e.g.
        //
        //	  000001:root.start.SstartSplash...:root.Q0A.CSSbSRule1Part1AS...
        CEFObject._framendx = 0;
        return CEFObject;
    }(TutorEngineOne.CEFAnimator));
    TutorEngineOne.CEFObject = CEFObject;
})(TutorEngineOne || (TutorEngineOne = {}));
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
/// <reference path = "CEFObject.ts"/>
var TutorEngineOne;
(function (TutorEngineOne) {
    //** Imports
    var CEFScene = /** @class */ (function (_super) {
        __extends(CEFScene, _super);
        function CEFScene() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.fComplete = false; // scene Complete Flag
            _this.sceneAttempt = 1;
            return _this;
            //*************** TimeLine/Seek Events		
            //****** Overridable Behaviors
        }
        /**
         * Scene Constructor
         */
        CEFScene.prototype.CEFScene = function () {
            this.traceMode = false;
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("CEFScene:Constructor");
        };
        CEFScene.prototype.onCreate = function () {
            // Parse the Tutor.config for create procedures for this scene 
            if ((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].create != undefined))
                this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].create.children(), "create");
            //## Mod May 04 2014 - support declarative button actions from scenedescr.xml <create>
            if (this.onCreateScript != null)
                this.doCreateAction();
            //## Mod Oct 25 2012 - support for demo scene-initialization
            if ((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].demoinit != undefined))
                this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].demoinit.children(), "demoinit");
        };
        /**
         *  Must provide valid execution context when operating at Scene level as here parentScene is NULL
         *
         */
        CEFScene.prototype.doCreateAction = function () {
            try {
                eval(this.onCreateScript);
            }
            catch (e) {
                TutorEngineOne.CUtil.trace("Error in onCreate script: " + this.onCreateScript);
            }
        };
        CEFScene.prototype.doExitAction = function () {
            if (this.onExitScript != null) {
                try {
                    eval(this.onExitScript);
                }
                catch (e) {
                    TutorEngineOne.CUtil.trace("Error in onExit script: " + this.onExitScript);
                }
            }
        };
        /**
         * polymorphic UI set up
         */
        CEFScene.prototype.initUI = function () {
        };
        //*************** Effect management - from Audio Stream
        /**
         *
         */
        CEFScene.prototype.effectHandler = function (evt) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Effect Event: " + evt);
            this[evt.prop1](evt.prop2, evt.prop3, evt.prop4, evt.prop5);
        };
        /**
         *
         */
        CEFScene.prototype.scriptHandler = function (evt) {
            var fTest = true;
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Effect Event: " + evt);
            // If initializer is featured - execute matching features
            if (evt.script.features != undefined) {
                // Each element of the fFeature vector contains an id for a feature of the tutor.
                // This permits the tutor to have multiple independently managed features.
                // All identifiers of all the feature sets must be globally unique.
                fTest = TutorEngineOne.CEFRoot.gTutor.testFeatureSet(String(evt.script.features));
            }
            // Note "common" elements within the packet will search the SceneConfig space for matches,
            // which may or may not be desirable. 
            if (fTest)
                this.parseOBJ(this, evt.script.children(), "script");
        };
        //*************** Effect management - from Audio Stream
        //***************** Logging *******************************		
        /**
         * encode experiment tag polymorphically
         *
         */
        CEFScene.prototype.logSceneTag = function () {
            //@@ State Logging - return polymorphic tag info
            return { 'scenetag': this.sceneTag, 'attempt': this.sceneAttempt++ };
            //@@ State Logging			
        };
        //***************** Logging *******************************		
        //****** Overridden Behaviors
        //***************** Automation *******************************		
        CEFScene.prototype.initAutomation = function (_parentScene, scene, ObjIdRef, lLogger, lTutor) {
            // parse all the component objects - NOTE: everything must be derived from CEFObject
            //
            var sceneObj;
            var wozObj;
            var wozRoot;
            // Do XML initialization
            this.onCreate();
            // Do Automation Capture
            for (var i1 = 0; i1 < this.numChildren; i1++) {
                sceneObj = this.getChildAt(i1);
                // Record each Object within scene
                //
                scene[sceneObj.name] = new Object;
                scene[sceneObj.name].instance = sceneObj;
                // Have Object determine its inplace size
                //
                if (sceneObj instanceof TutorEngineOne.CEFObject) {
                    //## Mod Apr 14 2014 - maintain linkage to parent scene - used for D.eval execution context - e.g. button script execution
                    sceneObj.parentScene = _parentScene;
                    sceneObj.measure();
                }
                // Record object in-place position - This is only done for top level objects in scene to record their inplace positions 
                // for inter-scene tweening.
                //
                // scene[sceneObj.name].inPlace = {X:sceneObj.x, Y:sceneObj.y, Width:sceneObj.width, Height:sceneObj.height, Alpha:sceneObj.alpha};	 //** TODO */							
                if (this.traceMode)
                    TutorEngineOne.CUtil.trace("\t\tCEFScene found subObject named:" + sceneObj.name + " ... in-place: ");
                // Recurse WOZ Children
                //
                if (sceneObj instanceof TutorEngineOne.CEFObject) {
                    wozObj = sceneObj; // Coerce the Object					
                    wozObj.initAutomation(_parentScene, scene[sceneObj.name], name + ".", lLogger, lTutor);
                }
                if (this.traceMode)
                    for (var id in scene[sceneObj.name].inPlace) {
                        TutorEngineOne.CUtil.trace("\t\t\t\t" + id + " : " + scene[sceneObj.name].inPlace[id]);
                    }
            }
        };
        // Walk the WOZ Objects to capture their default state
        //
        CEFScene.prototype.captureDefState = function (TutScene) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("\t*** Start Capture - Walking Top Level Objects***");
            for (var sceneObj in TutScene) {
                if (sceneObj != "instance" && TutScene[sceneObj].instance instanceof TutorEngineOne.CEFObject) {
                    if (this.traceMode)
                        TutorEngineOne.CUtil.trace("capturing: " + TutScene[sceneObj].instance.name);
                    TutScene[sceneObj].instance.captureDefState(TutScene[sceneObj]);
                }
            }
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("\t*** End Capture - Walking Top Level Objects***");
        };
        // Walk the WOZ Objects to restore their default state
        //
        CEFScene.prototype.restoreDefState = function (TutScene) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("\t*** Start Restore - Walking Top Level Objects***");
            for (var sceneObj in TutScene) {
                if (sceneObj != "instance" && TutScene[sceneObj].instance instanceof TutorEngineOne.CEFObject) {
                    if (this.traceMode)
                        TutorEngineOne.CUtil.trace("restoring: " + TutScene[sceneObj].instance.name);
                    TutScene[sceneObj].instance.restoreDefState(TutScene[sceneObj]);
                }
            }
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("\t*** End Restore - Walking Top Level Objects***");
        };
        // Walk the WOZ Objects to initialize their automation mode
        //
        CEFScene.prototype.setObjMode = function (TutScene, sMode) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("\t*** Start - Walking Top Level Objects***");
            for (var sceneObj in TutScene) {
                if (sceneObj != "instance" && TutScene[sceneObj].instance instanceof TutorEngineOne.CEFObject) {
                    TutScene[sceneObj].instance.setAutomationMode(TutScene[sceneObj], sMode);
                }
            }
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("\t*** End - Walking Top Level Objects***");
        };
        //***************** Automation *******************************		
        //****** Overridden Behaviors
        //***************** Debug *******************************		
        CEFScene.prototype.dumpSceneObjs = function (TutScene) {
            for (var sceneObj in TutScene) {
                if (this.traceMode)
                    TutorEngineOne.CUtil.trace("\tSceneObj : " + sceneObj);
                if (sceneObj != "instance" && TutScene[sceneObj].instance instanceof TutorEngineOne.CEFObject) {
                    if (this.traceMode)
                        TutorEngineOne.CUtil.trace("\tCEF***");
                    TutScene[sceneObj].instance.dumpSubObjs(TutScene[sceneObj], "\t");
                }
            }
        };
        //***************** Debug *******************************		
        //****** Overridable Behaviors
        /**
         * Polymorphic Navigation enabling
        */
        CEFScene.prototype.updateNav = function () {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("UpdateNavigation: ", name, this.fComplete);
            // Update the Navigation
            //
            if (!this.fComplete)
                TutorEngineOne.CEFRoot.gTutor.enableNext(false);
            else
                TutorEngineOne.CEFRoot.gTutor.enableNext(true);
            if (this.gForceBackButton)
                TutorEngineOne.CEFRoot.gTutor.enableBack(TutorEngineOne.CEFRoot.fEnableBack);
        };
        /**
         * Polymorphic question complete criteria
        */
        CEFScene.prototype.questionFinished = function (evt) {
            // User selection has been made
            //
            this.fComplete = true;
            // Update the Navigation
            //
            this.updateNav();
        };
        /**
         * Polymorphic question complete criteria
         */
        CEFScene.prototype.questionComplete = function () {
            // User selection has been made
            //
            return this.fComplete;
        };
        //****** Navigation Behaviors
        // Default behavior - Set the Tutor Title and return same target scene
        // Direction can be - "WOZNEXT" , "WOZBACK" , "WOZGOTO"
        // 
        // return values - label of target scene or one of "WOZNEXT" or "WOZBACK"
        //
        CEFScene.prototype.preEnterScene = function (lTutor, sceneLabel, sceneTitle, scenePage, Direction) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Default Pre-Enter Scene Behavior: " + sceneTitle);
            // Update the title				
            //
            lTutor.StitleBar.Stitle.text = sceneTitle;
            lTutor.StitleBar.Spage.text = scenePage;
            // Set fComplete and do other demo specific processing here
            // deprecated 
            this.demoBehavior();
            // Parse the Tutor.config for preenter procedures for this scene 
            if ((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].preenter != undefined))
                this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].preenter.children(), "preenter");
            //@@ Mod May 22 2013 - moved to after the XML spec is executed - If the user uses the back button this should
            //                     override the spec based on fComplete
            // Update the Navigation
            //
            if (this.fComplete)
                this.updateNav();
            // polymorphic UI initialization - must be done after this.parseOBJ 
            //
            this.initUI();
            return sceneLabel;
        };
        CEFScene.prototype.deferredEnterScene = function (Direction) {
        };
        CEFScene.prototype.onEnterScene = function (Direction) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Default Enter Scene Behavior:");
            // Parse the Tutor.config for onenter procedures for this scene 
            if ((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].onenter != undefined))
                this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].onenter.children(), "onenter");
        };
        // Direction can be - "NEXT" , "BACK" , "GOTO"
        // 
        CEFScene.prototype.preExitScene = function (Direction, sceneCurr) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Default Pre-Exit Scene Behavior:");
            // Parse the Tutor.config for onenter procedures for this scene 
            if ((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].preexit != undefined))
                this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].preexit.children(), "preexit");
            return (TutorEngineOne.CEFObject.OKNAV);
        };
        CEFScene.prototype.onExitScene = function () {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Default Exit Scene Behavior:");
            // Parse the Tutor.config for onenter procedures for this scene 
            if ((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].onexit != undefined))
                this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].onexit.children(), "onexit");
        };
        //****** DEMO Behaviors
        // Update the Navigation Features on entry
        //
        CEFScene.prototype.demoBehavior = function () {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Default demoBehavior: ");
        };
        //****** DEMO Behaviors
        //****** Navigation Behaviors
        //*************** TimeLine/Seek Events		
        CEFScene.prototype.initSeekArrays = function () {
            // place scene specific seek events into arrays	
        };
        CEFScene.prototype.doSeekForward = function (evt) {
            switch (evt.wozSeekSeq) {
            }
        };
        CEFScene.prototype.doSeekBackward = function (evt) {
        };
        return CEFScene;
    }(TutorEngineOne.CEFObject));
    TutorEngineOne.CEFScene = CEFScene;
})(TutorEngineOne || (TutorEngineOne = {}));
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
var TutorEngineOne;
(function (TutorEngineOne) {
    //** Imports
    /**
    * ...
    *
    * ## Mod Apr 15 2014 - rebased from CEFScene - was CEFObject
    */
    var CEFNavigator = /** @class */ (function (_super) {
        __extends(CEFNavigator, _super);
        function CEFNavigator() {
            //************ Stage Symbols
            var _this = _super !== null && _super.apply(this, arguments) || this;
            //************ Stage Symbols
            _this.sceneCnt = 0;
            //*************** Navigator "ROOT INSTANCE" CONSTANTS - 
            // Place these within a subclass to set the root of a navigation sequence
            // See CEFNavPanel
            //static Stthis.scenePrev:number;
            //static Stthis.sceneCurr:number;
            //
            //static StsceneTitle:Array;		// initialize the Tutor specific scene titles
            //static Stthis.sceneSeq:Array;			// initialize the Tutor specific scene sequence
            //*************** Navigator "ROOT INSTANCE" CONSTANTS - 
            _this._inNavigation = false;
            return _this;
        }
        CEFNavigator.prototype.CEFNavigator = function () {
            this.traceMode = false;
            this.SnextButton.addEventListener(CEFMouseEvent.WOZCLICK, this.onButtonNext);
            this.SbackButton.addEventListener(CEFMouseEvent.WOZCLICK, this.onButtonPrev);
            this.gNavigator = this;
        };
        Object.defineProperty(CEFNavigator.prototype, "iteration", {
            /**
             * returns the current scenes iteration count
             */
            get: function () {
                return "null";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneObj", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Add a scene to a navigation sub-sequence - These sequences are driven by scene events not NEXT/PREV button clicks
         * @param	sceneTitle
         * @param	this.sceneName
         */
        CEFNavigator.prototype.addScene = function (SceneTitle, ScenePage, SceneName, SceneClass, ScenePersist, SceneFeatures) {
            if (SceneFeatures === void 0) { SceneFeatures = "null"; }
        };
        //*************** Navigator getter setters - 
        CEFNavigator.prototype.connectToTutor = function (parentTutor, autoTutor) {
            CEFNavigator.prntTutor = parentTutor;
            CEFNavigator.TutAutomator = autoTutor;
        };
        Object.defineProperty(CEFNavigator.prototype, "scenePrev", {
            //*************** Navigator getter setters - 
            // Override these within a subclass to set the root of a navigation sequence
            get: function () {
                return 0;
            },
            set: function (scenePrevINT) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneCurr", {
            get: function () {
                return 0;
            },
            set: function (sceneCurrINT) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneCurrINC", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneCurrDEC", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneTitle", {
            get: function () {
                return new Array();
            },
            set: function (sceneTitleARRAY) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneSeq", {
            get: function () {
                return new Array();
            },
            set: function (sceneSeqARRAY) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "scenePage", {
            get: function () {
                return new Array();
            },
            set: function (scenePageARRAY) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneName", {
            get: function () {
                return new Array();
            },
            set: function (sceneSeqARRAY) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "sceneClass", {
            get: function () {
                return new Array();
            },
            set: function (sceneSeqARRAY) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFNavigator.prototype, "scenePersist", {
            get: function () {
                return new Array();
            },
            set: function (sceneSeqARRAY) {
            },
            enumerable: true,
            configurable: true
        });
        // Deprecated - Jul 18 2013 - unused
        //		public getScene() : string
        //		{
        //			// returns the scene ordinal in the sequence array or 0
        //			//
        //			return this.sceneSeq[this.sceneCurr];
        //		}
        // Deprecated - Jul 18 2013 - unused
        //		/**
        //		 * insert a new scene at the given sequence index
        //		 * 
        //		 * @param	sceneNdx   - The index of the current scene
        //		 * @param	this.sceneName  - The name of the Scene to insert
        //		 * @param	sceneTitle - The title of the Scene to insert
        //		 * @return
        //		 */
        //		public insertScene(SceneNdx:number, SceneName:string, SceneTitle:string ) : CEFScene
        //		{
        //			// returns the scene ordinal in the sequence array or 0
        //			//
        //			sceneTitle.splice(SceneNdx + 1, 0, SceneTitle); 
        //			  this.sceneSeq.splice(SceneNdx + 1, 0, SceneName); 
        //			
        //			return TutAutomator[this.sceneSeq[SceneNdx]].instance;
        //		}		
        //@@ Mod Jul 18 2013 - public -> private
        CEFNavigator.prototype.findSceneOrd = function (tarScene) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("findSceneOrd: " + tarScene);
            var i1;
            var ordScene = 0;
            var newScene;
            // Find the ordinal for the requested scene Label
            //
            for (i1 = 0; i1 < this.sceneCnt; i1++) {
                if (this.sceneSeq[i1] == tarScene) {
                    ordScene = i1;
                    break;
                }
            }
            // returns the scene ordinal in the sequence array or 0
            //
            return ordScene;
        };
        CEFNavigator.prototype.goToScene = function (tarScene) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Nav To: " + tarScene);
            var ordScene = -1;
            var newScene = "";
            var redScene = "";
            //@@ Mod Sep 27 2011 - protect against recurrent calls
            if (this._inNavigation)
                return;
            this._inNavigation = true;
            //@@ 
            // In demo mode we defer any demo button clicks while scene changes are in progress
            if (TutorEngineOne.CEFRoot.fDemo)
                TutorEngineOne.CEFRoot.fDeferDemoClick = true;
            // Find the ordinal for the requested scene Label
            //
            ordScene = this.findSceneOrd(tarScene);
            // If we don't find the requested scene just skip it
            //
            if (ordScene >= 0) {
                if (this.traceMode)
                    TutorEngineOne.CUtil.trace("Nav GoTo Found: " + tarScene);
                // remember current frame
                this.scenePrev = this.sceneCurr;
                // No redirection if switching to demo navigator scene
                if (tarScene == "SdemoScene") {
                    // Do the exit behavior
                    CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preExitScene("WOZGOTO", this.sceneCurr);
                    // switch the curent active scene
                    this.sceneCurr = ordScene;
                }
                else
                    switch (redScene = CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preExitScene("WOZGOTO", this.sceneCurr)) {
                        case CEFNavigator.CANCELNAV:// Do not allow scene to change
                            if (TutorEngineOne.CEFRoot.fDemo)
                                TutorEngineOne.CEFRoot.fDeferDemoClick = false;
                            //@@ Mod Sep 27 2011 - protect against recurrent calls
                            this._inNavigation = false;
                            return;
                        case CEFNavigator.OKNAV:// Move to GOTO scene 
                            this.sceneCurr = ordScene;
                            break;
                        default:// Goto the scene defined by the current scene
                            this.sceneCurr = this.findSceneOrd(redScene);
                    }
                // Do scene Specific initialization - scene returns the Label of the desired target scene
                // This allows the scene to do redirection
                // We allow iterative redirection
                //
                for (redScene = this.sceneSeq[this.sceneCurr]; redScene != newScene;) {
                    //*** Create scene on demand
                    //
                    if (CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]] == undefined) {
                        CEFNavigator.prntTutor.instantiateScene(this.sceneName[this.sceneCurr], this.sceneClass[this.sceneCurr]);
                    }
                    newScene = redScene;
                    redScene = CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preEnterScene(CEFNavigator.prntTutor, newScene, this.sceneTitle[this.sceneCurr], this.scenePage[this.sceneCurr], "WOZGOTO");
                    //@@@ NOTE: either discontinue support for redirection through PreEnterScene - or manage scene creation and destruction here
                    if (redScene == "WOZNEXT") {
                        this.sceneCurrINC;
                        redScene = this.sceneSeq[this.sceneCurr];
                    }
                    if (redScene == "WOZBACK") {
                        this.sceneCurrDEC;
                        redScene = this.sceneSeq[this.sceneCurr];
                    }
                    else
                        this.sceneCurr = this.findSceneOrd(redScene);
                }
                //@@ Action Logging
                var logData = { 'navevent': 'navgoto', 'curscene': this.scenePrev, 'newscene': redScene };
                //letxmlVal:XML = <navgoto curscene={this.scenePrev} newscene={redScene}/>
                this.gLogR.logNavEvent(logData);
                //@@ Action Logging			
                // On exit behaviors
                CEFNavigator.TutAutomator[this.sceneSeq[this.scenePrev]].instance.onExitScene();
                // Initialize the stategraph for the new scene
                // Do the scene transitions
                CEFNavigator.prntTutor.xitions.addEventListener(CEFEvent.COMPLETE, this.doEnterScene);
                CEFNavigator.prntTutor.xitions.gotoScene(redScene);
            }
        };
        /**
         * gotoNextScene Event driven entry point
         * @param	evt
         */
        CEFNavigator.prototype.onButtonNext = function (evt) {
            //@@ debug - for building XML spec of Tutor spec only - captureSceneGraph
            //			 note allowed for non-click events - i.e. virtual invocations see: CEFDoc.launchTutors():
            //			if(evt != null)
            //				gTutor.captureSceneGraph();			
            this.gotoNextScene();
        };
        /**
         * 	recoverState - called from CEFDoc.launchTutors to restart an interrupted session
         */
        CEFNavigator.prototype.recoverState = function () {
        };
        /**
         * gotoNextScene manual entry point
         */
        CEFNavigator.prototype.gotoNextScene = function () {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Nav Next: ");
            var newScene;
            var redScene = "";
            //@@ Mod Sep 27 2011 - protect against recurrent calls
            if (this._inNavigation)
                return;
            this._inNavigation = true;
            //@@ 						
            // In demo mode we defer any demo button clicks while scene changes are in progress
            if (TutorEngineOne.CEFRoot.fDemo)
                TutorEngineOne.CEFRoot.fDeferDemoClick = true;
            if (this.sceneCurr < this.sceneCnt) {
                // remember current frame
                //
                if (this.traceMode)
                    TutorEngineOne.CUtil.trace("this.scenePrev: " + this.scenePrev + "  - this.sceneCurr: " + this.sceneCurr);
                this.scenePrev = this.sceneCurr;
                // Do scene Specific termination 
                //
                if (this.traceMode)
                    TutorEngineOne.CUtil.trace("this.sceneSeq[this.sceneCurr]: " + this.sceneSeq[this.sceneCurr]);
                // Allow current scene to update next scene dynamically
                //
                switch (redScene = CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preExitScene("WOZNEXT", this.sceneCurr)) {
                    case CEFNavigator.CANCELNAV:// Do not allow scene to change
                        if (TutorEngineOne.CEFRoot.fDemo)
                            TutorEngineOne.CEFRoot.fDeferDemoClick = false;
                        //@@ Mod Sep 27 2011 - protect against recurrent calls
                        this._inNavigation = false;
                        return;
                    case CEFNavigator.OKNAV:// Move to next scene in sequence
                        this.sceneCurrINC;
                        break;
                    default:// Goto the scene defined by the current scene
                        this.sceneCurr = this.findSceneOrd(redScene);
                }
                // Do scene Specific initialization - scene returns the Label of the desired target scene
                // This allows the scene to do redirection
                // We allow iterative redirection
                //
                for (redScene = this.sceneSeq[this.sceneCurr]; redScene != newScene;) {
                    //CEFNavigator.prntTutor.enumScenes();	//@@debug
                    //*** Create scene on demand
                    //
                    TutorEngineOne.CUtil.trace(this.sceneSeq[this.sceneCurr]);
                    TutorEngineOne.CUtil.trace(CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]]);
                    if (CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]] == undefined) {
                        CEFNavigator.prntTutor.instantiateScene(this.sceneName[this.sceneCurr], this.sceneClass[this.sceneCurr]);
                    }
                    newScene = redScene;
                    //@@@ NOTE: either discontinue support for redirection through PreEnterScene - or manage scene creation and destruction here
                    redScene = CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preEnterScene(CEFNavigator.prntTutor, newScene, this.sceneTitle[this.sceneCurr], this.scenePage[this.sceneCurr], "WOZNEXT");
                    // Skip to next scene in sequence
                    if (redScene == "WOZNEXT") {
                        this.sceneCurrINC;
                        redScene = this.sceneSeq[this.sceneCurr];
                    }
                    // Stay were we are
                    if (redScene == "WOZBACK") {
                        this.sceneCurrDEC;
                        redScene = this.sceneSeq[this.sceneCurr];
                    }
                    else
                        this.sceneCurr = this.findSceneOrd(redScene);
                }
                //@@ Action Logging
                var logData = { 'navevent': 'navnext', 'curscene': this.scenePrev, 'newscene': redScene };
                //letxmlVal:XML = <navnext curscene={this.scenePrev} newscene={redScene}/>
                this.gLogR.logNavEvent(logData);
                //@@ Action Logging							
                // On exit behaviors
                CEFNavigator.TutAutomator[this.sceneSeq[this.scenePrev]].instance.onExitScene();
                // Do the scene transitions
                CEFNavigator.prntTutor.xitions.addEventListener(CEFEvent.COMPLETE, this.doEnterNext);
                CEFNavigator.prntTutor.xitions.gotoScene(redScene);
            }
        };
        /**
         * prevScene Event driven entry point
         * @param	evt
         */
        CEFNavigator.prototype.onButtonPrev = function (evt) {
            this.gotoPrevScene();
        };
        /**
         * prevScene manual entry point
         * Mod Jul 18 2013 - public -> private
         */
        CEFNavigator.prototype.gotoPrevScene = function () {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("Nav Back: ");
            var newScene = "";
            var redScene = "";
            //@@ Mod Sep 27 2011 - protect against recurrent calls
            if (this._inNavigation)
                return;
            this._inNavigation = true;
            //@@ 
            // In demo mode we defer any demo button clicks while scene changes are in progress
            if (TutorEngineOne.CEFRoot.fDemo)
                TutorEngineOne.CEFRoot.fDeferDemoClick = true;
            if (this.sceneCurr >= 1) {
                // remember current frame
                //
                this.scenePrev = this.sceneCurr;
                // Allow current scene to update next scene dynamically
                //
                switch (redScene = CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preExitScene("WOZBACK", this.sceneCurr)) {
                    case CEFNavigator.CANCELNAV:// Do not allow scene to change
                        if (TutorEngineOne.CEFRoot.fDemo)
                            TutorEngineOne.CEFRoot.fDeferDemoClick = false;
                        //@@ Mod Sep 27 2011 - protect against recurrent calls
                        this._inNavigation = false;
                        return;
                    case CEFNavigator.OKNAV:// Move to next scene in sequence
                        this.sceneCurrDEC;
                        break;
                    default:// Goto the scene defined by the current scene
                        this.sceneCurr = this.findSceneOrd(redScene);
                }
                // Do scene Specific initialization - scene returns the Label of the desired target scene
                // This allows the scene to do redirection
                // We allow iterative redirection
                //
                for (redScene = this.sceneSeq[this.sceneCurr]; redScene != newScene;) {
                    newScene = redScene;
                    redScene = CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preEnterScene(CEFNavigator.prntTutor, newScene, this.sceneTitle[this.sceneCurr], this.scenePage[this.sceneCurr], "WOZBACK");
                    if (redScene == "WOZNEXT") {
                        this.sceneCurrINC;
                        redScene = this.sceneSeq[this.sceneCurr];
                    }
                    if (redScene == "WOZBACK") {
                        this.sceneCurrDEC;
                        redScene = this.sceneSeq[this.sceneCurr];
                    }
                    else
                        this.sceneCurr = this.findSceneOrd(redScene);
                }
                //@@ Action Logging
                var logData = { 'navevent': 'navback', 'curscene': this.scenePrev, 'newscene': redScene };
                //letxmlVal:XML = <navback curscene={this.scenePrev} newscene={redScene}/>
                this.gLogR.logNavEvent(logData);
                //@@ Action Logging			
                // On exit behaviors
                CEFNavigator.TutAutomator[this.sceneSeq[this.scenePrev]].instance.onExitScene();
                // Do the scene transitions
                CEFNavigator.prntTutor.xitions.addEventListener(CEFEvent.COMPLETE, this.doEnterBack);
                CEFNavigator.prntTutor.xitions.gotoScene(redScene);
            }
        };
        // Performed immediately after scene is fullly onscreen
        //@@ Mod Jul 18 2013 - public -> private
        //
        CEFNavigator.prototype.doEnterNext = function (evt) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("this.doEnterNext: ", this.sceneCurr);
            CEFNavigator.prntTutor.xitions.removeEventListener(CEFEvent.COMPLETE, this.doEnterNext);
            //*** Destroy non persistent scenes
            //
            if (!this.scenePersist[this.scenePrev]) {
                // remove it from the tutor itself
                CEFNavigator.prntTutor.destroyScene(this.sceneName[this.scenePrev]);
            }
            // Do scene Specific Enter Scripts
            //
            CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.onEnterScene("WOZNEXT");
            //CEFNavigator.prntTutor.enumScenes();	//@@debug
            // In demo mode defer demo clicks while scene switches are in progress
            if (TutorEngineOne.CEFRoot.fDemo)
                CEFNavigator.prntTutor.dispatchEvent(new Event("deferedDemoCheck"));
            //@@ Mod Sep 27 2011 - protect against recurrent calls
            this._inNavigation = false;
            //@@ DEBUG
            //dumpStage(stage, "stage");			
        };
        // Performed immediately after scene is fullly onscreen
        //@@ Mod Jul 18 2013 - public -> private
        //
        CEFNavigator.prototype.doEnterBack = function (evt) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("doEnterBack: ", this.sceneCurr);
            CEFNavigator.prntTutor.xitions.removeEventListener(CEFEvent.COMPLETE, this.doEnterBack);
            //*** Destroy non persistent scenes
            //
            if (!this.scenePersist[this.scenePrev]) {
                CEFNavigator.prntTutor.destroyScene(this.sceneName[this.scenePrev]);
            }
            // Do scene Specific Enter Scripts
            //
            CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.onEnterScene("WOZBACK");
            // In demo mode defer demo clicks while scene switches are in progress
            if (TutorEngineOne.CEFRoot.fDemo)
                CEFNavigator.prntTutor.dispatchEvent(new Event("deferedDemoCheck"));
            //@@ Mod Sep 27 2011 - protect against recurrent calls
            this._inNavigation = false;
        };
        // Performed immediately after scene is fully onscreen
        //@@ Mod Jul 18 2013 - public -> private
        //
        CEFNavigator.prototype.doEnterScene = function (evt) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("this.doEnterScene: ", this.sceneCurr);
            CEFNavigator.prntTutor.xitions.removeEventListener(CEFEvent.COMPLETE, this.doEnterScene);
            //*** Destroy non persistent scenes
            //
            if (!this.scenePersist[this.scenePrev]) {
                CEFNavigator.prntTutor.destroyScene(this.sceneName[this.scenePrev]);
            }
            // Do scene Specific Enter Scripts
            //
            CEFNavigator.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.onEnterScene("WOZGOTO");
            // In demo mode defer demo clicks while scene switches are in progress
            if (TutorEngineOne.CEFRoot.fDemo)
                CEFNavigator.prntTutor.dispatchEvent(new Event("deferedDemoCheck"));
            //@@ Mod Sep 27 2011 - protect against recurrent calls
            this._inNavigation = false;
        };
        return CEFNavigator;
    }(TutorEngineOne.CEFScene));
    TutorEngineOne.CEFNavigator = CEFNavigator;
})(TutorEngineOne || (TutorEngineOne = {}));
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
var TutorEngineOne;
(function (TutorEngineOne) {
    //** Imports
    var CUtil = /** @class */ (function (_super) {
        __extends(CUtil, _super);
        function CUtil() {
            return _super.call(this) || this;
        }
        CUtil.trace = function (message) {
            var alt = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                alt[_i - 1] = arguments[_i];
            }
            var fullMessage = "";
            if (message instanceof Array) {
            }
            else if (arguments.length > 1) {
                for (var item in arguments) {
                    fullMessage += fullMessage.concat(item, " ");
                }
                console.log(fullMessage);
            }
            else {
                console.log(message);
            }
        };
        CUtil.getTimer = function () {
            return ((CUtil.now && CUtil.now.call(CUtil.w.performance)) || (new Date().getTime()));
        };
        CUtil.getQualifiedClassName = function (value) {
            var type = typeof value;
            if (!value || (type != "object" && !value.prototype)) {
                return type;
            }
            var prototype = value.prototype ? value.prototype : Object.getPrototypeOf(value);
            if (prototype.hasOwnProperty("__class__")) {
                return prototype["__class__"];
            }
            var constructorString = prototype.constructor.toString().trim();
            var index = constructorString.indexOf("(");
            var className = constructorString.substring(9, index);
            Object.defineProperty(prototype, "__class__", {
                value: className,
                enumerable: false,
                writable: true
            });
            return className;
        };
        CUtil.prototype.getDefinitionByName = function (name) {
            if (!name)
                return null;
            var definition = CUtil.getDefinitionByNameCache[name];
            if (definition) {
                return definition;
            }
            var paths = name.split(".");
            var length = paths.length;
            definition = __global;
            for (var i = 0; i < length; i++) {
                var path = paths[i];
                definition = definition[path];
                if (!definition) {
                    return null;
                }
            }
            CUtil.getDefinitionByNameCache[name] = definition;
            return definition;
        };
        // Use the performance sytem timer if available.
        // see: https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
        //
        CUtil.w = window;
        CUtil.now = CUtil.w.performance.now || CUtil.w.performance.mozNow || CUtil.w.performance.msNow ||
            CUtil.w.performance.oNow || CUtil.w.performance.webkitNow;
        CUtil.getDefinitionByNameCache = {};
        return CUtil;
    }(Object));
    TutorEngineOne.CUtil = CUtil;
})(TutorEngineOne || (TutorEngineOne = {}));
var __global = this.__global || this;
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
/// <reference types= "easeljs"/>
/// <reference path = "CEFScene.ts"/>
/// <reference path = "CEFNavigator.ts"/>
/// <reference path = "../util/CUtil.ts"/>
/// <reference path = "../network/ILogManager.ts"/>
var TutorEngineOne;
(function (TutorEngineOne) {
    //** Imports
    var MovieClip = createjs.MovieClip;
    var EFengine;
    var CEFRoot = /** @class */ (function (_super) {
        __extends(CEFRoot, _super);
        //********
        /**
         * Root Object constructor
         *
         */
        function CEFRoot() {
            var _this = _super.call(this) || this;
            _this._listenerArr = new Array; // Array of listeners on this object - 
            _this.traceMode = false;
            if (_this.traceMode)
                TutorEngineOne.CUtil.trace("CEFRoot:Constructor");
            // By default we set the woz name to the object name.
            // Sub-classes can modify wozName to have objects behave independently in CWOZTransitions
            //
            _this.wozName = "CEF" + CEFRoot._wozInstance.toString();
            CEFRoot._wozInstance++;
            return _this;
        }
        CEFRoot.prototype.Destructor = function () {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace("CEFRoot Destructor:");
            // parse all the component objects - NOTE: everything must be derived from CWOZObject
            //
            var subObj;
            for (var i1 = 0; i1 < this.numChildren; i1++) {
                subObj = this.getChildAt(i1);
                // Recurse WOZ Children
                //
                if (subObj instanceof CEFRoot) {
                    subObj.Destructor();
                }
            }
        };
        //***************** Automation *******************************		
        CEFRoot.prototype.captureXMLStructure = function (parentXML, iDepth) {
            // parse all the component objects - NOTE: everything must be derived from CWOZObject
            //
            var element;
            var elementOBJ = {};
            var elClass;
            var elwozname;
            for (var i1 = 0; i1 < this.numChildren; i1++) {
                element = this.getChildAt(i1);
                if (this.traceMode)
                    TutorEngineOne.CUtil.trace("\t\tCEFScene found subObject named:" + element.name + " ... in-place: ");
                // elClass = this.getQualifiedClassName(element);
                // Recurse WOZ Children
                //
                if (element instanceof CEFRoot) {
                    elwozname = element.wozName;
                }
                else {
                    elwozname = "null";
                }
                elementOBJ = new String("<obj " + " class=\"" + elClass + "\" name=\"" + element.name + "\" x=\"" + element.x + "\" y=\"" + element.y + "\" w=\"" + element.width + "\" h=\"" + element.height + "\" r=\"" + element.rotation + "\" a=\"" + element.alpha + "\"/>");
                // Limit the depth of recursion - optional
                if ((iDepth < 1) && (element instanceof CEFRoot))
                    element.captureXMLStructure(elementOBJ, iDepth + 1);
                // parentXML.appendChild(elementOBJ);
            }
        };
        //************** SceneConfig Initialization 
        /*
        *
        */
        CEFRoot.prototype.resetXML = function () {
        };
        /*
            *
            */
        CEFRoot.prototype.loadXML = function (propVector) {
        };
        /*
            *
            */
        CEFRoot.prototype.saveXML = function () {
            var stateVector;
            return stateVector;
        };
        // @@@@@@@@@@@
        CEFRoot.prototype.getSymbolClone = function (_cloneOf, _named) {
            var xClone = ""; // CEFRoot.gSceneConfig.scenedata[_cloneOf].create.symbol.(@wozname==_named).table[0];
            TutorEngineOne.CUtil.trace(xClone);
            return xClone;
        };
        Object.defineProperty(CEFRoot.prototype, "gData", {
            //************** SceneConfig Initialization 
            //***************** Automation *******************************				
            //***************** Globals ****************************
            get: function () {
                return CEFRoot.SceneData;
            },
            set: function (dataXML) {
                CEFRoot.SceneData = dataXML;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFRoot.prototype, "gPhase", {
            //@@ Mod May 16 2013 - support for prepost upgrade
            get: function () {
                return CEFRoot.fTutorPart;
            },
            set: function (phase) {
                CEFRoot.fTutorPart = phase;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFRoot.prototype, "gLogR", {
            //@@ Mod May 07 2012 - support for relative module pathing
            get: function () {
                return CEFRoot.logR;
            },
            set: function (logr) {
                if (this.traceMode)
                    TutorEngineOne.CUtil.trace("Connecting Logger: ");
                CEFRoot.logR = logr;
            },
            enumerable: true,
            configurable: true
        });
        /*
        *	restore scenedata XML to allow reuse of scene
        */
        CEFRoot.prototype.resetSceneDataXML = function () {
            //CEFRoot.sceneConfig.replace("scenedata", sceneDataArchive);
        };
        Object.defineProperty(CEFRoot.prototype, "gForceBackButton", {
            get: function () {
                return CEFRoot.fForceBackButton;
            },
            set: function (fForce) {
                CEFRoot.fForceBackButton = fForce;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CEFRoot.prototype, "gNavigator", {
            get: function () {
                return CEFRoot._gNavigator;
            },
            set: function (navObject) {
                CEFRoot._gNavigator = navObject;
            },
            enumerable: true,
            configurable: true
        });
        //***************** Globals ****************************
        //****** Overridable Behaviors
        //*************** Logging state management
        //******** Experimenter LOG
        /**
         * encode experiment state polymorphically
         * @return An XML object representing the current object state - for the experimenter
         */
        CEFRoot.prototype.logState = function () {
            //@@ State Logging			
            return "<null/>";
            //@@ State Logging			
        };
        //******** Experimenter LOG
        //*************** Logging state management
        /**
         * Check object status - Has user completed object initialization
         * @return int : 1 if object has been fully user (defined - completed - setup) - 0 otherwise
         */
        CEFRoot.prototype.IsUserDefined = function () {
            var iResult = 0;
            return iResult;
        };
        Object.defineProperty(CEFRoot.prototype, "captureLOGString", {
            //@@ Mod Jun 3 2013 - changed nethod to getter to support XML logging in scenegraph spec  
            //
            get: function () {
                return "";
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Capture an XML instance of the scene state for logging purposes
         * @return
         */
        CEFRoot.prototype.captureLOGState = function () {
            return "<null />";
        };
        /**
         * Provides a safe way to check for property existance on sealed classes
         * Watch uses - ActionScript worked differently -
         * hasOwnProperty checks class
         * in checks prototype chain.
         * @param	prop - String name of the property to check
         * @return  true - property is extant :   false - property is not extant
         */
        CEFRoot.prototype.isDefined = function (prop) {
            var fResult;
            try {
                if (this.hasOwnProperty(prop)) {
                    fResult = true;
                }
            }
            catch (err) {
                if (this.traceMode)
                    TutorEngineOne.CUtil.trace(prop + " is Undefined");
                fResult = false;
            }
            return fResult;
        };
        //*********** PLAY PAUSE STOP 		
        /**
         * Overload the play so that we can start and stop from array references
         *
         */
        CEFRoot.prototype.superPlay = function () {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace(name + " Super Play");
            //@@
            if (name == "SgenericPrompt")
                TutorEngineOne.CUtil.trace("SgenericPrompt Play Found in superPlay");
            //@@
            _super.prototype.play.call(this);
        };
        /**
         * Overload the play so that we can start and stop from array references
         *
         */
        CEFRoot.prototype.superStop = function () {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace(name + " Super Stop");
            _super.prototype.stop.call(this);
        };
        /**
         * Overload the gotoAndStop so that we can track what movies are playing and which aren't
         *
         */
        CEFRoot.prototype.gotoAndStop = function (frame, scene) {
            if (scene === void 0) { scene = null; }
            if (this.traceMode)
                TutorEngineOne.CUtil.trace(name + " is stopped at : " + frame + ":" + scene);
            if (CEFRoot.gTutor)
                CEFRoot.gTutor.playRemoveThis(this);
            _super.prototype.gotoAndStop.call(this, frame + ":" + scene);
        };
        /**
         * Overload the stop so that we can track what movies are playing and which aren't
         *
         */
        CEFRoot.prototype.stop = function () {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace(name + " is stopped");
            if (CEFRoot.gTutor)
                CEFRoot.gTutor.playRemoveThis(this);
            _super.prototype.stop.call(this);
        };
        /**
         * Overload the gotoAndPlay so that we can track what movies are playing and which aren't
         *
         */
        CEFRoot.prototype.gotoAndPlay = function (frame, scene) {
            if (scene === void 0) { scene = null; }
            if (this.traceMode)
                TutorEngineOne.CUtil.trace(name + " is playing at : " + frame + ":" + scene);
            //@@
            if (name == "SgenericPrompt")
                TutorEngineOne.CUtil.trace("SgenericPrompt Play Found in gotoAndPlay");
            //@@
            if (CEFRoot.gTutor)
                CEFRoot.gTutor.playAddThis(this);
            _super.prototype.gotoAndPlay.call(this, frame + ":" + scene);
        };
        /**
         * Overload the play so that we can track what movies are playing and which aren't
         *
         */
        CEFRoot.prototype.play = function () {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace(name + " is playing");
            //@@
            if (name == "SgenericPrompt")
                TutorEngineOne.CUtil.trace("SgenericPrompt Play Found in Play");
            //@@
            if (CEFRoot.gTutor)
                CEFRoot.gTutor.playAddThis(this);
            _super.prototype.play.call(this);
        };
        /**
         * wozPlay allows late binding to the Tutor object - use for scene object etc that are created after initAutomation call
         *
         */
        CEFRoot.prototype.bindPlay = function (tutor) {
            if (this.traceMode)
                TutorEngineOne.CUtil.trace(name + " is playing");
            //@@
            if (name == "SgenericPrompt")
                TutorEngineOne.CUtil.trace("SgenericPrompt Play Found in BindPlay");
            //@@
            if (CEFRoot.gTutor)
                CEFRoot.gTutor.playAddThis(this);
            _super.prototype.play.call(this);
        };
        CEFRoot.prototype.setTopMost = function () {
            var topPosition;
            try {
                if (CEFRoot.gTutor) {
                    topPosition = CEFRoot.gTutor.numChildren - 1;
                    CEFRoot.gTutor.setChildIndex(this, topPosition);
                }
            }
            catch (err) {
                // Just ignore if we aren't a child yet 
            }
        };
        //*********** PLAY PAUSE STOP 		
        //************ Session Timing
        CEFRoot.prototype.startSession = function () {
            // Init the start time of the session
            CEFRoot.fSessionTime = TutorEngineOne.CUtil.getTimer();
        };
        Object.defineProperty(CEFRoot.prototype, "sessionTime", {
            get: function () {
                var curTime;
                curTime = (TutorEngineOne.CUtil.getTimer() - CEFRoot.fSessionTime) / 1000.0;
                return curTime.toString();
            },
            enumerable: true,
            configurable: true
        });
        //************ Session Timing
        //****** Overridable Behaviors
        CEFRoot.prototype.instantiateObject = function (objectClass) {
            var tarObject;
            var ClassRef = this.getDefinitionByName(objectClass);
            tarObject = new ClassRef;
            return tarObject;
        };
        CEFRoot.prototype.getDefinitionByName = function (className) {
            var classConstructor;
            classConstructor = EFengine.efLibrary[className];
            return classConstructor;
        };
        //***************** Debug *******************************		
        CEFRoot.prototype.dumpStage = function (_obj, _path) {
            var sceneObj;
            for (var i1 = 0; i1 < _obj.numChildren; i1++) {
                sceneObj = _obj.getChildAt(i1);
                if (sceneObj) {
                    TutorEngineOne.CUtil.trace(_path + "." + sceneObj["name"] + " visible : " + ((sceneObj.visible) ? " true" : " false"));
                    if (sceneObj)
                        this.dumpStage(sceneObj, _path + "." + sceneObj["name"]);
                }
            }
        };
        CEFRoot.STAGEWIDTH = 1024;
        CEFRoot.STAGEHEIGHT = 768;
        //*** Demo configuration
        CEFRoot.fRemoteMode = false; // Used to control SWFLoader security domain
        CEFRoot.fDemo = true; // Controls the insertion of the demo selection scene 
        CEFRoot.fDebug = true; // Controls whether the server connection is used			
        CEFRoot.fLog = false; // Controls whether logging is used or not		Note: Affects ILogManager constructor
        CEFRoot.fDeferDemoClick = true; // defer demo button clicks while scene changes are in progress
        //********
        CEFRoot.fTutorPart = "Intro & Ramp Pre-test"; // Goes in to the xml header to indicate the portion of the tutor the file represents - deprecated Jun 6 2013 - see CLogManager 
        CEFRoot.fFullSignIn = false; // Set dynamically based upon Feature Set		
        //****************		
        CEFRoot.fSkipAssess = false; // Controls where to go after the ramp test - user trials support 	
        CEFRoot.fEnableBack = true; // force all back buttons to enabled
        CEFRoot.fForceBackButton = true; //@@ Mod May 22 2013 - Prepost module integration - back button behaves different in prepost then anywhere else
        //                     So in general outside the prepost we force the back button to off
        CEFRoot.fSkillometer = false; //@@ Mod Mar2 2012 - support for showing skillometer in loader
        //********
        CEFRoot.sessionAccount = new Object(); //@@ Mod Dec 03 2013 - session Account data  
        CEFRoot.serverUserID = 0; // Numeric user ID assigned by the logging server DB
        CEFRoot.fPlaybackMode = false;
        CEFRoot.WOZREPLAY = "rootreplay";
        CEFRoot.WOZCANCEL = "rootcancel";
        CEFRoot.WOZPAUSING = "rootpause";
        CEFRoot.WOZPLAYING = "rootplay";
        CEFRoot.SceneData = "<data/>"; // Root Tutor data cache				
        CEFRoot._wozInstance = 1;
        return CEFRoot;
    }(MovieClip));
    TutorEngineOne.CEFRoot = CEFRoot;
})(TutorEngineOne || (TutorEngineOne = {}));
//# sourceMappingURL=EdForgeEngine.js.map